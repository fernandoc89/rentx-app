import fs from "fs";

export const deleteFile = async (filename: string) => {
  // Try vai verificar através da função stat se o arquivo existe. Se não existe returna.
  try {
    await fs.promises.stat(filename);
  } catch {
    return;
  }

  // Se existir, a função unlink vai remover o arquivo
  await fs.promises.unlink(filename);
};
