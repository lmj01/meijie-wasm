$curPwd = $pwd.path;

$dracoSrcPath = Join-Path $curPwd "build/draco"
$dracoBuildPath = Join-Path $curPwd "builddraco"
if (Test-Path -Path $dracoBuildPath) {

} else {
    mkdir builddraco
}
cd builddraco
cmake --preset release
cmake --build --preset release -DDRACO_TRANSCODER_SUPPORTED=ON -DDRACO_JS_GLUE=ON -DCMAKE_BUILD_TYPE=Release -G "Visual Studio 16 2019" -A x64 $dracoSrcPath
MSBuild.exe draco.sln /t:Build /p:Configuration=Release
cd ..