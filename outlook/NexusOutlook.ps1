[CmdletBinding()]
param([string]$PayloadUri, [string]$ReplyFile, [switch]$ValidateOnly)

$ErrorActionPreference = 'Stop'

function Read-NexusReply {
    param([string]$Uri, [string]$File)
    if (([bool]$Uri) -eq ([bool]$File)) { throw 'Indica un solo mensaje para contestar.' }
    if ($Uri) {
        if ($Uri.Length -gt 6000 -or $Uri -cnotmatch '^nexus-outlook://reply/([A-Za-z0-9_-]+)$') { throw 'Enlace de respuesta no valido.' }
        $encoded = $Matches[1].Replace('-', '+').Replace('_', '/')
        $encoded = $encoded.PadRight($encoded.Length + ((4 - $encoded.Length % 4) % 4), '=')
        $json = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($encoded))
    } else {
        if ([IO.Path]::GetExtension($File) -ne '.nexusreply' -or $File.StartsWith('\\')) { throw 'Archivo de respuesta no valido.' }
        $fileInfo = Get-Item -LiteralPath $File
        if ($fileInfo.Length -gt 1500000) { throw 'Archivo demasiado grande.' }
        $json = [IO.File]::ReadAllText($fileInfo.FullName, [Text.Encoding]::UTF8)
    }
    $data = $json | ConvertFrom-Json
    if ($data.version -ne 1) { throw 'Version de respuesta no compatible.' }
    foreach ($field in @('to', 'subject', 'originalFrom', 'originalTo', 'originalSubject', 'receivedAt', 'body', 'internetMessageId')) {
        if ($data.$field -isnot [string]) { throw 'Mensaje de respuesta incompleto.' }
    }
    if ($data.to -match '[\r\n]' -or $data.to.Length -gt 320) { throw 'Destinatario no valido.' }
    $parsed = New-Object System.Net.Mail.MailAddress($data.to)
    if ($parsed.Address -cne $data.to) { throw 'Destinatario no valido.' }
    foreach ($field in @('subject', 'originalFrom', 'originalTo', 'originalSubject', 'receivedAt')) {
        if ($data.$field.Length -gt 1100 -or $data.$field -match '[\r\n]') { throw 'Cabecera de respuesta no valida.' }
    }
    if ($data.originalTo -notin @('grupos@hotelguadiana.es', 'grupos@encumbria.es') -or $data.body.Length -gt 200000) { throw 'Mensaje fuera del ambito de grupos.' }
    if ($data.internetMessageId -and $data.internetMessageId -cnotmatch '^<[^<>\s]{1,990}>$') { throw 'Identificador de mensaje no valido.' }
    return $data
}

function Get-NexusQuote {
    param($Data)
    $when = $Data.receivedAt
    $date = [DateTimeOffset]::MinValue
    if ([DateTimeOffset]::TryParse($when, [ref]$date)) { $when = $date.ToLocalTime().ToString('dd/MM/yyyy HH:mm') }
    return "`r`n`r`n----- Mensaje original -----`r`nDe: $($Data.originalFrom)`r`nPara: $($Data.originalTo)`r`nFecha: $when`r`nAsunto: $($Data.originalSubject)`r`n`r`n$($Data.body)"
}

try {
    $data = Read-NexusReply -Uri $PayloadUri -File $ReplyFile
    if ($ValidateOnly) { Write-Output 'Respuesta validada; Outlook no se ha abierto.'; exit 0 }
    $outlook = New-Object -ComObject Outlook.Application
    $mail = $outlook.CreateItem(0)
    $mail.BodyFormat = 2
    $mail.To = $data.to
    $mail.Subject = $data.subject
    if ($data.internetMessageId) {
        $mail.PropertyAccessor.SetProperty('http://schemas.microsoft.com/mapi/proptag/0x1042001F', $data.internetMessageId)
        $mail.PropertyAccessor.SetProperty('http://schemas.microsoft.com/mapi/proptag/0x1039001F', $data.internetMessageId)
    }
    # Display first: Outlook inserts the user's configured default signature.
    # Append through WordEditor so signature formatting and inline images survive.
    $mail.Display($false)
    $inspector = $mail.GetInspector
    $document = $inspector.WordEditor
    if (-not $document) { throw 'Outlook no ha abierto el editor. Usa Outlook clasico.' }
    $tail = $document.Range($document.Content.End - 1, $document.Content.End - 1)
    $tail.InsertAfter((Get-NexusQuote -Data $data))
    $top = $document.Range(0, 0)
    $top.InsertBefore("`r`n`r`n")
    $document.Range(0, 0).Select()
    # Deliberately no Send or Save: the user edits and sends the draft in Outlook.
} catch {
    if ($ValidateOnly) { Write-Error $_.Exception.Message; exit 1 }
    Add-Type -AssemblyName System.Windows.Forms
    [Windows.Forms.MessageBox]::Show('No se ha podido preparar la respuesta. Comprueba que Outlook clasico esta configurado y que el archivo o enlace es valido. No se ha enviado ningun correo.', 'Nexus Groups') | Out-Null
    exit 1
}
