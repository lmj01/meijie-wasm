cmake_minimum_required(VERSION 3.28)
project(app)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(BGFX_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(BGFX_INSTALL_EXAMPLES OFF CACHE BOOL "" FORCE)
set(BGFX_CONFIG_DEBUG ON CACHE BOOL "" FORCE)
set(BGFX_BUILD_TOOLS OFF CACHE BOOL "" FORCE)

# Disable threading for Emscripten builds
if(EMSCRIPTEN)
    set(BGFX_CONFIG_MULTITHREADED OFF CACHE BOOL "" FORCE)
endif()

# Configure meshoptimizer (available in bgfx 3rdparty)
file(GLOB MESHOPT_SOURCES
  ${bgfx_SOURCE_DIR}/bgfx/3rdparty/meshoptimizer/src/*.cpp
)
add_library(meshoptimizer STATIC ${MESHOPT_SOURCES})
target_include_directories(meshoptimizer PUBLIC ${bgfx_SOURCE_DIR}/bgfx/3rdparty)

# Entry system files
set(ENTRY_FILES
    ${bgfx_SOURCE_DIR}/bgfx/examples/common/common.h
    ${bgfx_SOURCE_DIR}/bgfx/examples/common/bgfx_utils.h
    ${bgfx_SOURCE_DIR}/bgfx/examples/common/bgfx_utils.cpp
    ${bgfx_SOURCE_DIR}/bgfx/examples/common/entry/entry.h
    ${bgfx_SOURCE_DIR}/bgfx/examples/common/entry/entry.cpp
    ${bgfx_SOURCE_DIR}/bgfx/examples/common/entry/entry_p.h
    ${bgfx_SOURCE_DIR}/bgfx/examples/common/entry/cmd.h
    ${bgfx_SOURCE_DIR}/bgfx/examples/common/entry/cmd.cpp
    ${bgfx_SOURCE_DIR}/bgfx/examples/common/entry/input.h
    ${bgfx_SOURCE_DIR}/bgfx/examples/common/entry/input.cpp
    ${bgfx_SOURCE_DIR}/bx/include/bx/commandline.h
)

# Add platform-specific entry files
if(APPLE)
    list(APPEND ENTRY_FILES ${bgfx_SOURCE_DIR}/bgfx/examples/common/entry/entry_osx.mm)
elseif(WIN32)
    list(APPEND ENTRY_FILES ${bgfx_SOURCE_DIR}/bgfx/examples/common/entry/entry_windows.cpp)
elseif(UNIX AND NOT APPLE)
    list(APPEND ENTRY_FILES ${bgfx_SOURCE_DIR}/bgfx/examples/common/entry/entry_x11.cpp)
endif()

# Main executable
add_executable(${PROJECT_NAME}
    main.cpp
    ${ENTRY_FILES}
)

target_include_directories(${PROJECT_NAME} PRIVATE
    ${bgfx_SOURCE_DIR}/bgfx/include
    ${bgfx_SOURCE_DIR}/bx/include
    ${bgfx_SOURCE_DIR}/bimg/include
    ${bgfx_SOURCE_DIR}/bgfx/examples
    ${bgfx_SOURCE_DIR}/bgfx/examples/common/
    ${bgfx_SOURCE_DIR}/bgfx/3rdparty
    ${bgfx_SOURCE_DIR}
)

target_compile_definitions(${PROJECT_NAME} PRIVATE
    USE_ENTRY=1
    ENTRY_CONFIG_IMPLEMENT_MAIN=1
    BX_CONFIG_DEBUG=1
)

# Add threading definition for Emscripten
if(EMSCRIPTEN)
    target_compile_definitions(${PROJECT_NAME} PRIVATE
        BGFX_CONFIG_MULTITHREADED=0
    )
endif()

target_link_libraries(${PROJECT_NAME} PRIVATE
    bgfx
    bx
    bimg
    bimg_decode
    meshoptimizer
)

# Platform-specific configurations
if(EMSCRIPTEN)
    # WebAssembly/Emscripten configuration
    set(CMAKE_EXECUTABLE_SUFFIX ".html")

    # Option to use a custom shell file
    option(USE_CUSTOM_SHELL "Use a custom HTML shell file" OFF)

    target_compile_definitions(${PROJECT_NAME} PRIVATE
        EMSCRIPTEN=1
    )

    set(EMSCRIPTEN_LINKER_FLAGS
        "-s USE_WEBGL2=1"
        "-s WASM=1"
        "-s ALLOW_MEMORY_GROWTH=1"
        "-s ASSERTIONS=1"
        "-s EXPORTED_RUNTIME_METHODS=['cwrap']"
        "-s MIN_WEBGL_VERSION=2"
        "-s MAX_WEBGL_VERSION=2"
        "-s GL_DEBUG=1"
        "-s FULL_ES3=1"
    )

    # Add shell file option conditionally
    if(USE_CUSTOM_SHELL)
        list(APPEND EMSCRIPTEN_LINKER_FLAGS "--shell-file ${CMAKE_CURRENT_SOURCE_DIR}/shell.html")
    endif()

    string(REPLACE ";" " " EMSCRIPTEN_LINKER_FLAGS_STR "${EMSCRIPTEN_LINKER_FLAGS}")
    set_target_properties(${PROJECT_NAME} PROPERTIES LINK_FLAGS "${EMSCRIPTEN_LINKER_FLAGS_STR}")

elseif(APPLE)
    target_link_libraries(${PROJECT_NAME} PRIVATE "-framework Cocoa" "-framework QuartzCore" "-framework Metal" "-framework Foundation")
elseif(WIN32)
    # Windows-specific settings
elseif(UNIX AND NOT APPLE)
    # Linux dependencies
    find_package(X11 REQUIRED)
    target_link_libraries(${PROJECT_NAME} PRIVATE ${X11_LIBRARIES})
endif()