#include <iostream>
#include <string>
#include <vector>

struct BrowserState {
    std::string current;
    std::vector<std::string> backStack;
    std::vector<std::string> forwardStack;
};

std::vector<std::string> split(const std::string& value) {
    std::vector<std::string> result;
    std::string item;
    for (char character : value) {
        if (character == '|') {
            if (!item.empty()) result.push_back(item);
            item.clear();
        } else {
            item += character;
        }
    }
    if (!item.empty()) result.push_back(item);
    return result;
}

std::string escapeJson(const std::string& value) {
    std::string escaped;
    for (char character : value) {
        if (character == '\\' || character == '"') escaped += '\\';
        escaped += character;
    }
    return escaped;
}

void printArray(const std::vector<std::string>& values) {
    std::cout << "[";
    for (size_t i = 0; i < values.size(); i++) {
        if (i > 0) std::cout << ",";
        std::cout << "\"" << escapeJson(values[i]) << "\"";
    }
    std::cout << "]";
}

int main(int argc, char* argv[]) {
    if (argc < 5) {
        std::cerr << "Usage: browser_stack action current backStack forwardStack [url]\n";
        return 1;
    }

    const std::string action = argv[1];
    BrowserState state{argv[2], split(argv[3]), split(argv[4])};
    const std::string url = argc > 5 ? argv[5] : "";
    std::string message;

    if (action == "visit") {
        if (url.empty()) {
            std::cerr << "A URL is required for visit.\n";
            return 1;
        }
        if (!state.current.empty()) state.backStack.push_back(state.current);
        state.current = url;
        state.forwardStack.clear();
        message = "Visited a new page. Forward history was cleared.";
    } else if (action == "back") {
        if (state.backStack.empty()) {
            message = "Back stack is empty.";
        } else {
            state.forwardStack.push_back(state.current);
            state.current = state.backStack.back();
            state.backStack.pop_back();
            message = "Moved to the previous page.";
        }
    } else if (action == "forward") {
        if (state.forwardStack.empty()) {
            message = "Forward stack is empty.";
        } else {
            state.backStack.push_back(state.current);
            state.current = state.forwardStack.back();
            state.forwardStack.pop_back();
            message = "Moved to the next page.";
        }
    } else {
        std::cerr << "Unknown action.\n";
        return 1;
    }

    std::cout << "{\"current\":\"" << escapeJson(state.current)
              << "\",\"backStack\":";
    printArray(state.backStack);
    std::cout << ",\"forwardStack\":";
    printArray(state.forwardStack);
    std::cout << ",\"message\":\"" << escapeJson(message) << "\"}\n";
}
