// Retorna a data e hora atual em formato ISO (UTC)
const generateDateTimeISO = (): string => {
  return new Date().toISOString();
};

// Retorna apenas a data (YYYY-MM-DD) em UTC
const generateDateISO = (): string => {
  return new Date().toISOString().split("T")[0];
};

export { generateDateTimeISO, generateDateISO };
