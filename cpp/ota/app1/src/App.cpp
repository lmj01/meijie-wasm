#include "oatpp/Environment.hpp"
#include "oatpp/network/Server.hpp"
#include "oatpp/network/tcp/server/ConnectionProvider.hpp"
#include "oatpp/web/server/HttpConnectionHandler.hpp"
#include "oatpp/web/server/HttpRouter.hpp"
#include "handler.h"

void run() {
  auto router = oatpp::web::server::HttpRouter::createShared();
  router->route("GET", "/helloworld", std::make_shared<Handler>());

  auto connectionHandler = oatpp::web::server::HttpConnectionHandler::createShared(router);
  auto connectionProvider = oatpp::network::tcp::server::ConnectionProvider::createShared(
      {"0.0.0.0", 8080, oatpp::network::Address::IP_4});

  oatpp::network::Server server(connectionProvider, connectionHandler);
  OATPP_LOGi("Demo", "Server running on http://0.0.0.0:8080/helloworld");
  server.run();
}

int main() {
  oatpp::Environment::init();
  run();
  oatpp::Environment::destroy();
  return 0;
}
