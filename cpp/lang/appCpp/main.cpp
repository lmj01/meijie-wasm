#include <iostream>
#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

class Module {
public:
  virtual ~Module() = default;
  virtual void parseCommand(const std::string &name,
                            const std::string &value) = 0;
  virtual void handleRequest() = 0;
  const std::string &getName() const { return name_; }

protected:
  explicit Module(std::string name) : name_(std::move(name)) {}
  std::string name_;
};

class ModuleA : public Module {
public:
  ModuleA() : Module("moduleA") {}
  void parseCommand(const std::string &name,
                    const std::string &value) override {
    if (name == "max_conns") {
      config_.max_conns = std::stoi(value);
    }
  }
  void handleRequest() override {
    std::cout << "ModuleA: Handling request, max_conns=" << config_.max_conns
              << std::endl;
  }

private:
  struct Config {
    int max_conns = 0;
  };
  Config config_;
};

class ModuleB : public Module {
public:
  ModuleB() : Module("moduleB") {}

  void parseCommand(const std::string &name,
                    const std::string &value) override {
    if (name == "log_level") {
      config_.log_level = value;
    }
  }

  void handleRequest() override {
    std::cout << "ModuleB: Logging request, level=" << config_.log_level
              << std::endl;
  }

private:
  struct Config {
    std::string log_level;
  };
  Config config_;
};

class Server {
public:
  void addModule(std::unique_ptr<Module> module) {
    modules_.push_back(std::move(module));
  }

  void loadConfig(const std::unordered_map<std::string, std::string> &config) {
    for (const auto &[name, value] : config) {
      for (const auto &module : modules_) {
        module->parseCommand(name, value);
      }
    }
  }

  void processRequest() {
    for (const auto &module : modules_) {
      module->handleRequest();
    }
  }

private:
  std::vector<std::unique_ptr<Module>> modules_;
};

int main() {
  Server server;
  server.addModule(std::make_unique<ModuleA>());
  server.addModule(std::make_unique<ModuleB>());

  std::unordered_map<std::string, std::string> config = {
      {"max_conns", "100"}, {"log_level", "debug"}};

  server.loadConfig(config);
  server.processRequest();
  return 0;
}
