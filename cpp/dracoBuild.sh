#!/bin/bash
SOURCE_DIR="build/draco"
BUILD_DIR="builddraco"

if [ ! -d "${BUILD_DIR}" ]; then
    mkdir -p "${BUILD_DIR}"
    echo "fold not exist, and create new : $BUILD_DIR"
else 
    echo "fold exist: $BUILD_DIR"
fi
#cd "${BUILD_DIR}"

cmake "${SOURCE_DIR}" -DCMAKE_BUILD_TYPE=Release -G "Unix Makefiles" -A x64 "${BUILD_DIR}"
make 
echo "-- build complete --"
cd ..
