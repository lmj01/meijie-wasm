cmake_minimum_required (VERSION 3.24)

project (draco-wasm)
set (CMAKE_CXX_STANDARD 17)
# set (TARGET draco-wasm)
set (CMAKE_CONFIGURATION_TYPES Debug;Release)

# on window11 python problem with gbk
# set(ENV{PYTHONUTF8} 1)
# set(ENV{PYTHONIOENCODING} "utf8")

set(EMSCRIPTEN "${SOURCE_ROOT_DIR}/cpp/build/emsdk/upstream/emscripten")

get_filename_component(SOURCE_ROOT_DIR ${CMAKE_SOURCE_DIR} DIRECTORY)
message(WARNING "${SOURCE_ROOT_DIR}")
set(CMAKE_INSTALL_PREFIX "${SOURCE_ROOT_DIR}/packages/wasm-draco/lib")
set(DRACO_SOURCE_DIR "${SOURCE_ROOT_DIR}/cpp/build/draco")

if (${EMSCRIPTEN})
    add_subdirectory(${DRACO_SOURCE_DIR})
    add_compile_options(-DDRACO_JS_GLUE=ON)
    install(TARGETS ${PROJECT_NAME} DESTINATION ${CMAKE_INSTALL_PREFIX})
    install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${TARGET}.wasm DESTINATION ${CMAKE_INSTALL_PREFIX})
    install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${TARGET}.d.ts DESTINATION ${CMAKE_INSTALL_PREFIX})
endif ()