#!/bin/bash
SOURCE_DIR="$PWD/build/draco"
TOOLCHAIN="$PWD/build/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake"
BUILD_DIR="$PWD/builddraco"

export EMSCRIPTEN="$PWD/build/emsdk/upstream/emscripten"

if [ ! -d "${BUILD_DIR}" ]; then
    mkdir -p "${BUILD_DIR}"
    echo "fold not exist, and create new : $BUILD_DIR"
else 
    echo "fold exist: $BUILD_DIR"
fi
cd "${BUILD_DIR}"

cmake "${SOURCE_DIR}" -DCMAKE_TOOLCHAIN_FILE="${TOOLCHAIN}" -DDRACO_WASM=ON
make 
echo "-- build complete --"

