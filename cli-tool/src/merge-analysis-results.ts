import * as fs from "fs";
import * as path from "path";
import yargs from "yargs/yargs";

interface MergedAnalysis {
  file: string;
  content: any;
}

interface MergedAnalysesResult {
  createdAt: string;
  analyses: MergedAnalysis[];
}

const argv = yargs(process.argv.slice(2))
  .option("folder", {
    alias: "f",
    description: "Path to the folder containing analysis JSON files",
    type: "string",
    demandOption: true,
  })
  .help()
  .parse();

async function run(): Promise<void> {
  const args = await argv;
  const folderPath = path.resolve(args.folder);

  // Validate folder exists
  if (!fs.existsSync(folderPath)) {
    console.error(`Error: Folder not found at ${folderPath}`);
    process.exit(1);
  }

  const stats = fs.statSync(folderPath);
  if (!stats.isDirectory()) {
    console.error(`Error: Path is not a directory: ${folderPath}`);
    process.exit(1);
  }

  // Read all files in the folder
  const files = fs.readdirSync(folderPath);
  
  // Filter for *-analysis.json files
  const analysisFiles = files.filter((file) => {
    const basename = path.basename(file);
    return basename.endsWith("-analysis.json");
  });

  if (analysisFiles.length === 0) {
    console.log(`No analysis files found in ${folderPath}`);
    process.exit(0);
  }

  console.log(`Found ${analysisFiles.length} analysis file(s) to process.\n`);

  const analyses: MergedAnalysis[] = [];

  // Process each analysis file
  for (const analysisFile of analysisFiles) {
    console.log(`Processing: ${analysisFile}`);
    
    const filePath = path.join(folderPath, analysisFile);
    
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const parsedContent = JSON.parse(fileContent);
      
      analyses.push({
        file: analysisFile,
        content: parsedContent,
      });
    } catch (error: any) {
      console.error(`Error reading/parsing ${analysisFile}: ${error.message}`);
      process.exit(1);
    }
  }

  // Create merged result
  const mergedResult: MergedAnalysesResult = {
    createdAt: new Date().toISOString(),
    analyses: analyses,
  };

  // Write merged result to file
  const outputPath = path.join(folderPath, "merged-analyses.json");
  
  try {
    fs.writeFileSync(outputPath, JSON.stringify(mergedResult, null, 2), "utf-8");
    
    console.log(`\nProcessed ${analyses.length} analysis file(s)`);
    console.log(`Merged analyses written to: ${outputPath}`);
  } catch (error: any) {
    console.error(`Error writing merged file: ${error.message}`);
    process.exit(1);
  }
}

run();

