cmake_minimum_required (VERSION 3.22)

project (tool-wasm)


set (CMAKE_CXX_STANDARD 17)
# set (CMAKE_CONFIGURATION_TYPES Debug;Release)

set(CMAKE_INSTALL_PREFIX "${SOURCE_ROOT_DIR}/packages/chili-wasm/lib")

# 设置头文件
include_directories(include)

# 环境变量
set(EMSCRIPTEN "${SOURCE_ROOT_DIR}/../build/emsdk/upstream/emscripten")

set (WasmSourcesFolder src/wasm)
file (GLOB
    WasmSourceFiles CONFIGURE_DEPENDS
    ${WasmSourcesFolder}/*.hpp
    ${WasmSourcesFolder}/*.cpp
    src/tri_tri_intersect.c
)

add_library(tritri src/tri_tri_intersect.c)

if (${EMSCRIPTEN})
    add_executable (wasm_tri_tri ${WasmSourceFiles})
    target_compile_options (wasm_tri_tri PUBLIC
        $<$<CONFIG:Release>:-O3>
        $<$<CONFIG:Release>:-flto>
        $<IF:$<CONFIG:Release>,-sDISABLE_EXCEPTION_CATCHING=1,-sDISABLE_EXCEPTION_CATCHING=0>
    )

    target_link_options (wasm_tri_tri PUBLIC
        $<IF:$<CONFIG:Release>,-O3,-O0>
        $<$<CONFIG:Release>:-flto>
        $<IF:$<CONFIG:Release>,-sDISABLE_EXCEPTION_CATCHING=1,-sDISABLE_EXCEPTION_CATCHING=0>
        -sMODULARIZE=1
        -sEXPORT_ES6=1
        -sALLOW_MEMORY_GROWTH=1
        -sENVIRONMENT="web"
        --bind
        --emit-tsd "${TARGET}.d.ts"
    )
    target_include_directories (wasm_tri_tri PUBLIC include)
    install(FILES ${CMAKE_CURRENT_BINARY_DIR}/wasm_tri_tri.wasm DESTINATION ${CMAKE_INSTALL_PREFIX})
    install(FILES ${CMAKE_CURRENT_BINARY_DIR}/wasm_tri_tri.d.ts DESTINATION ${CMAKE_INSTALL_PREFIX})
endif ()

add_executable(appTriTri src/app_tri_tri.cpp)
target_link_libraries(appTriTri PRIVATE tritri)
target_include_directories (appTriTri PUBLIC include)



