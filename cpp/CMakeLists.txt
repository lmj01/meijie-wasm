cmake_minimum_required (VERSION 3.24)

project (draco-wasm)
set (CMAKE_CXX_STANDARD 17)
set (TARGET draco-wasm)
set (CMAKE_CONFIGURATION_TYPES Debug;Release)

get_filename_component(SOURCE_ROOT_DIR ${CMAKE_SOURCE_DIR} DIRECTORY)
set(CMAKE_INSTALL_PREFIX "${SOURCE_ROOT_DIR}/packages/wasm-draco/lib")
set(DRACO_SOURCE_DIR "${SOURCE_ROOT_DIR}/cpp/build/draco")

if (${EMSCRIPTEN})
    add_subdirectory(${DRACO_SOURCE_DIR})
    # add_executable (${TARGET} ${ChiliWasmSourceFiles} ${OcctSourceFiles})

    target_compile_options (${TARGET} PUBLIC
        $<$<CONFIG:Release>:-O3>
        $<$<CONFIG:Release>:-flto>
        $<IF:$<CONFIG:Release>,-sDISABLE_EXCEPTION_CATCHING=1,-sDISABLE_EXCEPTION_CATCHING=0>
        -DDRACO_JS_GLUE
    )

    target_link_options (${TARGET} PUBLIC
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

    # target_include_directories (${TARGET} PUBLIC ${OcctIncludeDirs})

    install(TARGETS ${TARGET} DESTINATION ${CMAKE_INSTALL_PREFIX})
    install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${TARGET}.wasm DESTINATION ${CMAKE_INSTALL_PREFIX})
    install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${TARGET}.d.ts DESTINATION ${CMAKE_INSTALL_PREFIX})
endif ()