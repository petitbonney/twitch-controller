import React, { useEffect } from "react";
import useCookie from "react-use-cookie";
import axios from "axios";

const useQuery = () => {
  const url = window.location.href;
  return Object.fromEntries(
    new URLSearchParams(url.substring(url.indexOf("?"))).entries()
  );
};

const hideParams = () => {
  const url = window.location.href;
  window.history.pushState("", "", url.substring(0, url.indexOf("?")));
};

const verify = (token) =>
  axios.get(process.env.REACT_APP_VERIFY_URI + "?token=" + token);

const connect = () => {
  document.location.assign(process.env.REACT_APP_CONNECT_URI);
};

const disconnect = (token) =>
  axios.get(process.env.REACT_APP_DISCONNECT_URI + "?token=" + token);

const App = () => {
  const [token, setToken] = useCookie("token", null);
  const query = useQuery();

  useEffect(() => {
    if (query.token) {
      verify(query.token)
        .then((res) => {
          setToken(query.token);
        })
        .catch((err) => {});
    } else {
      verify(token)
        .then((res) => {})
        .catch((err) => {
          setToken(null);
        });
    }
  }, []);

  useEffect(() => {
    const connectBtn = document.querySelector("#connect");
    if (token) {
      connectBtn.innerHTML = "Déconnexion";
      connectBtn.addEventListener("click", () => connect());
    } else {
      connectBtn.innerHTML = "Connexion";
      connectBtn.addEventListener("click", () => {
        disconnect(token);
      });
    }
    hideParams();
  }, [token]);

  return (
    <>
      <button id="connect"></button>
    </>
  );
};

export default App;
