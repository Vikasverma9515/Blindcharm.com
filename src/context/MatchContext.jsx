import { createContext, useState } from "react";

const MatchContext = createContext();

const MatchProvider = ({ children }) => {
  const [matches, setMatches] = useState([]);

  return (
    <MatchContext.Provider value={{ matches, setMatches }}>
      {children}
    </MatchContext.Provider>
  );
};

export { MatchContext, MatchProvider };
