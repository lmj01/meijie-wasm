#ifndef HANDLER_H
#define HANDLER_H

#include "oatpp/web/server/HttpRequestHandler.hpp"

class Handler : public oatpp::web::server::HttpRequestHandler {
public:
  std::shared_ptr<OutgoingResponse> handle(const std::shared_ptr<IncomingRequest>&) override {
    return ResponseFactory::createResponse(Status::CODE_200, "Hello, World!");
  }
};

#endif // HANDLER_H
