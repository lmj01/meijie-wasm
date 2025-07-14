FROM otapp:v1

RUN apk add python3
RUN apk add nodejs
RUN apk add npm
RUN apk add gcc
RUN apk add libc-dev

RUN git clone https://github.com/emscripten-core/emsdk.git /emsdk
WORKDIR /emsdk
#RUN ./emsdk install latest && ./emsdk activate latest
#ENV PATH="/emsdk:/emsdk/upstream/emscripten:${PATH}"

