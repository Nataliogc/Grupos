$ErrorActionPreference = 'Stop'
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false

$files = @(
    "C:\Users\comun\Documents\GitHub\Grupos\Guadiana Grupos desde 01-01-26 al 28-02-27.xlsx",
    "C:\Users\comun\Documents\GitHub\Grupos\Cumbria Grupos desde 01-01-26 al 28-02-27.xlsx"
)

foreach ($file in $files) {
    Write-Host "=== File: $file"
    $wb = $excel.Workbooks.Open($file)
    foreach ($ws in $wb.Worksheets) {
        Write-Host "- Sheet: $($ws.Name)"
        for ($r = 1; $r -le 2; $r++) {
            $line = ""
            for ($c = 1; $c -le 15; $c++) {
                $v = $ws.Cells.Item($r, $c).Text
                if ($v) { $line += "$v | " }
            }
            if ($line) { Write-Host "Row ${r}: $line" }
        }
    }
    $wb.Close($false)
}
$excel.Quit()
