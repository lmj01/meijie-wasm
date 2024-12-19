$curPwd = $pwd.path;
$dracoBuildPath = Join-Path $curPwd "builddraco"
$encoder = Join-Path $dracoBuildPath "Release/draco_encoder.exe"
$decoder = Join-Path $dracoBuildPath "Release/draco_decoder.exe"

$assetsFolder1 = Join-Path $curPwd "../packages/three-draco/src/assets"
# 解压
# $inDrc = Join-Path $assetsFolder1 "bunny.drc"
$inDrc = Join-Path $assetsFolder1 "bunny.npm.drc"
# &$decoder -i $inDrc -o bunny2.ply

# 压缩
$inPly = Join-Path $curPwd "bunny2.ply"
echo $inPly
&$encoder -i $inPly -o bunny2.drc