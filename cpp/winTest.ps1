$curPwd = $pwd.path;
$dracoBuildPath = Join-Path $curPwd "builddraco"
$encoder = Join-Path $dracoBuildPath "Release/draco_encoder.exe"
$decoder = Join-Path $dracoBuildPath "Release/draco_decoder.exe"

$assetsFolder1 = Join-Path $curPwd "../packages/three-draco/src/assets"
$inDrc = Join-Path $assetsFolder1 "bunny.drc"
# 解码
&$decoder -i $inDrc -o bunny.ply