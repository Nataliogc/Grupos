[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$targetDirectory = Join-Path $env:LOCALAPPDATA 'NexusGroups\Outlook'
New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
$targetScript = Join-Path $targetDirectory 'NexusOutlook.ps1'
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'NexusOutlook.ps1') -Destination $targetScript -Force
$shellExe = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$baseCommand = '"' + $shellExe + '" -NoProfile -STA -WindowStyle Hidden -File "' + $targetScript + '"'
$scheme = 'HKCU:\Software\Classes\nexus-outlook'
New-Item -Path "$scheme\shell\open\command" -Force | Out-Null
Set-Item -LiteralPath $scheme -Value 'URL:Nexus Groups Outlook'
New-ItemProperty -LiteralPath $scheme -Name 'URL Protocol' -Value '' -PropertyType String -Force | Out-Null
Set-Item -LiteralPath "$scheme\shell\open\command" -Value ($baseCommand + ' -PayloadUri "%1"')
$fileType = 'HKCU:\Software\Classes\NexusGroups.Reply'
New-Item -Path "$fileType\shell\open\command" -Force | Out-Null
Set-Item -LiteralPath $fileType -Value 'Respuesta de Nexus Groups'
Set-Item -LiteralPath "$fileType\shell\open\command" -Value ($baseCommand + ' -ReplyFile "%1"')
New-Item -Path 'HKCU:\Software\Classes\.nexusreply' -Force | Out-Null
Set-Item -LiteralPath 'HKCU:\Software\Classes\.nexusreply' -Value 'NexusGroups.Reply'
Write-Output 'Enlace de Outlook instalado para este usuario. No se han cambiado las firmas ni la politica de ejecucion.'
