// 程序化纹理生成算法
#version 460 core
layout(rgba32f, binding = 0) uniform writeonly image2D outputImage;
layout(local_size_x = 16, local_size_y = 16) in;

void main()
{
    // 获取当前线程处理的像素坐标
    ivec2 pixelCoord = ivec2(gl_GlobalInvocationID.xy);
    // 判断越界访问
    if (pixelCoord.x >= imageSize(outputImage).x || pixelCoord.y >= imageSize(outputImage).y)
		  return;

    // 将像素坐标归一化到[0,1]
    ivec2 texSize = imageSize(outputImage);
    vec2 fTexSize = vec2(texSize);
    vec2 normalizedCoord = vec2(pixelCoord) / vec2(texSize);

    vec4 O = vec4(0, 0, 0, 1);
    vec2 I = vec2(pixelCoord);

    float iTime = 1.2;
    float i = 0.0, t = iTime;
    O *= i;
    // 初始纹理
    vec2 a = fTexSize.xy, p = ( I + I - a) / a.y;
    for(; i++ < 20.;) {
        // 计算坐标
        // mat2实现旋转/缩放效果
        // fract产生重复模式
        mat2 transform = mat2(cos(cos(.2 * t + .2 * i) + vec4(0,11,33,0)));
        //mat2 transform = mat2(1.0);
        a = (fract(.2 * t + .3 * p * i * transform) - .5);
        a.x = abs(a).x;
        // 计算颜色
        // 分子，通过嵌套三角函数生成动态颜色分量, cos(sin())产生复杂振荡
        // 分母，控制衰减
        O += (cos(sin(i * .2 + t) * vec4(0,4,3,1)) + 2.) / (i / 1e3 + abs(length(a - .5 * min(a + a.yx, .1)) - .05));
        //O += (cos(sin(i * .2 + t) * vec4(0,4,3,1)) + 2.) / 0.5;
    }
    // 使用双曲正切函数压缩动态范围，增强对比度
    O = tanh(O * O / 2e5);

    vec4 color = vec4(normalizedCoord, 0.0, 1.0);
    imageStore(outputImage, pixelCoord, O);
}