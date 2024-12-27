#!/bin/bash
SOURCE_DIR="$PWD/build/draco"
TOOLCHAIN="$PWD/build/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake"
BUILD_DIR="$PWD/builddraco"

TARGET_DIR="$PWD/../packages/mjdraco/public/libs/meijie"
FNAMES=("draco_encoder.js" "draco_encoder.wasm" "draco_decoder.js" "draco_decoder.wasm")

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

if [ ! -d "${TARGET_DIR}" ]; then
	mkdir -p "${TARGET_DIR}"
else
	echo "target folder exist"
fi

for name in "${FNAMES[@]}"
do 
    cp "${BUILD_DIR}/$name" "${TARGET_DIR}/$name"
done
