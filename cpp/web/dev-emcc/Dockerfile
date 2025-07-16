FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y python3
RUN apt-get install -y git 
RUN apt-get install -y cmake
RUN apt-get install -y nodejs
RUN apt-get install -y npm
RUN apt-get install -y wget 

RUN git clone https://github.com/emscripten-core/emsdk.git /emsdk
WORKDIR /emsdk
RUN ./emsdk install latest && ./emsdk activate latest
ENV PATH="/emsdk:/emsdk/upstream/emscripten:/emsdk/upstream/bin:${PATH}"

