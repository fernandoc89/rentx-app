import csvParse from "csv-parse";
import fs from "fs";
import { inject, injectable } from "tsyringe";

import { ICategoriesRepository } from "@modules/cars/repositories/ICategoriesRepository";

interface IImportCategory {
  name: string;
  description: string;
}

@injectable()
class ImportCategoryUseCase {
  constructor(
    @inject("CategoriesRepository")
    private categoriesRepository: ICategoriesRepository
  ) {}

  loadCategories(file: Express.Multer.File): Promise<IImportCategory[]> {
    return new Promise((resolve, reject) => {
      // createReadStream permite que faça a leitura do arquivo em partes que está no path e joga na const stream
      const stream = fs.createReadStream(file.path);

      const categories: IImportCategory[] = [];

      // csv parse lê linha por linha e armazena na const
      const parseFile = csvParse();

      // função pipe pega o que ta sendo lido (cada pedaço) em stream e joga em um local que determinarmos (parseFile)
      stream.pipe(parseFile);

      parseFile
        .on("data", async (line) => {
          // [ "name", "description"]
          const [name, description] = line;
          categories.push({ name, description });
        })
        .on("end", () => {
          fs.promises.unlink(file.path); // unlink faz a remoção do arquivo, recebendo um path
          resolve(categories);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  }

  // arquivo vem da request (Insomnia)
  async execute(file: Express.Multer.File): Promise<void> {
    const categories = await this.loadCategories(file);

    categories.map(async (category) => {
      const { name, description } = category;

      const existCategory = await this.categoriesRepository.findByName(name);

      if (!existCategory) {
        await this.categoriesRepository.create({
          name,
          description,
        });
      }
    });
  }
}
export { ImportCategoryUseCase };
