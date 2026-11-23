# Gera botao-acessibilidade.zip, pronto para enviar em Plugins > Adicionar novo > Enviar plugin (WordPress).
# Monta o zip "na mão" para os caminhos usarem "/": o Compress-Archive do Windows PowerShell grava "\",
# e em hospedagem Linux isso vira um arquivo com "\" no nome em vez de uma pasta.
$aqui = $PSScriptRoot
$plugin = Join-Path $aqui 'wordpress\botao-acessibilidade'
Copy-Item (Join-Path $aqui 'acessibilidade.js') $plugin -Force
$zip = Join-Path $aqui 'botao-acessibilidade.zip'
if (Test-Path $zip) { Remove-Item $zip -Force }

Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$arquivo = [System.IO.Compression.ZipFile]::Open($zip, 'Create')
try {
  Get-ChildItem $plugin -Recurse -File | ForEach-Object {
    $relativo = $_.FullName.Substring($plugin.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($arquivo, $_.FullName, "botao-acessibilidade/$relativo") | Out-Null
  }
} finally {
  $arquivo.Dispose()
}
Write-Output "Pronto: $zip"
