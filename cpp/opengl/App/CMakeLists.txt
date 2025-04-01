
# App

set(SOURCE_DIR "Source")

# Define the source and destination paths for the shader
set(SHADER_SOURCE "${CMAKE_SOURCE_DIR}/App/Shaders/Compute.glsl")
set(SHADER_DESTINATION "${CMAKE_BINARY_DIR}/App/Shaders/Compute.glsl")

set(SOURCES
    Source/Main.cpp
    Source/Shader.h
    Source/Shader.cpp
    Source/Renderer.h
    Source/Renderer.cpp
)

# Add the executable target
add_executable(App ${SOURCES})
target_link_libraries(App glfw)
target_link_libraries(App glad)
target_link_libraries(App glm)

# Copy the shader to the build directory after build
add_custom_command(TARGET App POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy ${SHADER_SOURCE} ${SHADER_DESTINATION}
    COMMENT "Copying Compute.glsl to build directory"
)