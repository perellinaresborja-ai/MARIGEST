
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('public/logo.png')
$sizes = @(192, 512, 180)
foreach ($s in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap $s, $s
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)
    $gfx.Clear([System.Drawing.Color]::Transparent)
    $gfx.DrawImage($img, 0, 0, $s, $s)
    $gfx.Dispose()
    if ($s -eq 180) {
        $bmp.Save('public/apple-touch-icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
    } else {
        $bmp.Save('public/icon-' + $s + 'x' + $s + '.png', [System.Drawing.Imaging.ImageFormat]::Png)
    }
    $bmp.Dispose()
}
$img.Dispose()

