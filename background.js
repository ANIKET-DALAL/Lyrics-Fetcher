let msg = {
  txt: "hello",
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.greeting === "hello") sendResponse(msg);
});
