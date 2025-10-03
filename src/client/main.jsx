import ReactDOM from "react-dom/client";
import React from "react"
import App from './App';
function MainApp() {


  return (
   <App></App>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>,
);