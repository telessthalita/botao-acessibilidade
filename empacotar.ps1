# Gera botao-acessibilidade.zip, pronto para enviar em Plugins > Adicionar novo > Enviar plugin (WordPress).
$aqui = $PSScriptRoot
$plugin = Join-Path $aqui 'wordpress\botao-acessibilidade'
Copy-Item (Join-Path $aqui 'acessibilidade.js') $plugin -Force
$zip = Join-Path $aqui 'botao-acessibilidade.zip'
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path $plugin -DestinationPath $zip
Write-Output "Pronto: $zip"
