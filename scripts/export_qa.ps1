$ErrorActionPreference = "Stop"
$src = "F:\网易龙虾\梅州客家非遗_课程门户网站_20260805\downloads\meizhou-hakka-heritage-slides.pptx"
$pdf = "F:\网易龙虾\梅州客家非遗_课程门户网站_20260805\output\slides-qa.pdf"
$p = New-Object -ComObject PowerPoint.Application
try {
  $pres = $p.Presentations.Open($src, 1, 0, 0)
  $pres.ExportAsFixedFormat($pdf, 2)
  $pres.Close()
  Write-Output "PDF_OK"
} finally {
  $p.Quit()
}
