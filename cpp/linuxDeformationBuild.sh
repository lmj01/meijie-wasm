#!/bin/bash
SOURCE_DIR="$PWD/deformation"
TOOLCHAIN="$PWD/build/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake"
BUILD_DIR="$PWD/bdeformation"

TARGET_DIR="$PWD/../packages/mjdeformation/public/libs/meijie"

FNAMES=("deformation-wasm.js" "deformation-wasm.wasm")

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
	echo "folder exist"
fi

for name in "${FNAMES[@]}"
do
	cp "${BUILD_DIR}/$name" "${TARGET_DIR}/$name"
done

