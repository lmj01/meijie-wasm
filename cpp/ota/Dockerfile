# Dockerfile
FROM ubuntu
LABEL org.meijie.image.authors="meijie"
# 设置环境变量
ENV DEBIAN_FRONTEND=noninteractive

# 安装必要的依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    wget \
    clang \
    gdb \
    valgrind \
    libcurl4-openssl-dev \
    libssl-dev \
    libjsoncpp-dev \
    && rm -rf /var/lib/apt/lists/*

# 安装oatpp
RUN git clone https://github.com/oatpp/oatpp.git /opt/oatpp && \
    cd /opt/oatpp && \
    mkdir build && \
    cd build && \
    cmake .. && \
    make install -j$(nproc)

# 安装oatpp-swagger
RUN git clone https://github.com/oatpp/oatpp-swagger.git /opt/oatpp-swagger && \
    cd /opt/oatpp-swagger && \
    mkdir build && \
    cd build && \
    cmake .. && \
    make install -j$(nproc)

# 清理
#RUN rm -rf /opt/oatpp /opt/oatpp-swagger

# 设置工作目录
WORKDIR /workspace

# 安装CLion remote开发工具
#RUN wget -qO- "https://git.io/vQgMr" | sh -s -- --without-nvidia

COPY ./app1 /workspace/app1

RUN cd /workspace/app1 && \
    mkdir build && \
    cd build && \
    cmake .. && \
    make && \
    ./bin/oatpp_example

