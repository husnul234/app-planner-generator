#!/usr/bin/env node
/**
 * AppPlanner AI CLI Task Runner (NgodingPakeAI Adaptation)
 * Usage:
 *   node scripts/cli.js task list
 *   node scripts/cli.js task next
 *   node scripts/cli.js task done TASK-01
 *   node scripts/cli.js task prompt TASK-01
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");

// Locate tasks.md (check root directory or workspace)
function findTasksFile() {
  const possiblePaths = [
    path.join(ROOT_DIR, "tasks.md"),
    path.join(ROOT_DIR, "src", "tasks.md"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(ROOT_DIR, "tasks.md");
}

function parseTasksFromMarkdown(content) {
  const lines = content.split("\n");
  const tasks = [];
  let currentTask = null;
  let currentPhase = "Umum";
  let inPromptBlock = false;
  let promptLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## Fase ") || line.startsWith("## Phase ")) {
      currentPhase = line.replace(/^##\s*/, "").trim();
      continue;
    }

    const taskMatch = line.match(/^###\s*\[([ xX])\]\s*(TASK-\d+):\s*(.+)$/);
    if (taskMatch) {
      if (currentTask) {
        if (promptLines.length > 0) {
          currentTask.aiPrompt = promptLines.join("\n").trim();
        }
        tasks.push(currentTask);
      }

      currentTask = {
        id: taskMatch[2],
        completed: taskMatch[1].toLowerCase() === "x",
        title: taskMatch[3].trim(),
        phase: currentPhase,
        category: "General",
        targetFiles: [],
        description: "",
        aiPrompt: "",
        acceptanceCriteria: "",
        lineIndex: i,
      };
      promptLines = [];
      inPromptBlock = false;
      continue;
    }

    if (currentTask) {
      if (line.startsWith("```markdown")) {
        inPromptBlock = true;
        continue;
      }
      if (inPromptBlock && line.startsWith("```")) {
        inPromptBlock = false;
        continue;
      }
      if (inPromptBlock) {
        promptLines.push(line);
        continue;
      }

      if (line.startsWith("- **Kategori:**")) {
        currentTask.category = line.replace("- **Kategori:**", "").trim();
      } else if (line.startsWith("- **File Target:**")) {
        currentTask.targetFiles = line
          .replace("- **File Target:**", "")
          .split(",")
          .map((f) => f.replace(/[`*]/g, "").trim());
      } else if (line.startsWith("- **Deskripsi:**")) {
        currentTask.description = line.replace("- **Deskripsi:**", "").trim();
      } else if (line.startsWith("- **Kriteria Selesai:**")) {
        currentTask.acceptanceCriteria = line.replace("- **Kriteria Selesai:**", "").trim();
      }
    }
  }

  if (currentTask) {
    if (promptLines.length > 0) {
      currentTask.aiPrompt = promptLines.join("\n").trim();
    }
    tasks.push(currentTask);
  }

  return tasks;
}

function printHeader() {
  console.log("\x1b[36m============================================================\x1b[0m");
  console.log("\x1b[1m\x1b[32m AppPlanner AI - Task Runner & Execution Engine\x1b[0m");
  console.log("\x1b[90m Adapted from NgodingPakeAI step-by-step agent workflow\x1b[0m");
  console.log("\x1b[36m============================================================\x1b[0m\n");
}

function handleList(tasks) {
  printHeader();
  if (tasks.length === 0) {
    console.log("\x1b[33mTidak ada task yang ditemukan di tasks.md.\x1b[0m");
    console.log("Jalankan generator di UI atau buat file tasks.md terlebih dahulu.\n");
    return;
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPct = Math.round((completedCount / tasks.length) * 100);

  console.log(`\x1b[1mProgress: ${completedCount}/${tasks.length} task selesai (${progressPct}%)\x1b[0m`);
  console.log(`[${"=".repeat(Math.round(progressPct / 5))}${" ".repeat(20 - Math.round(progressPct / 5))}]\n`);

  let currentPhase = "";
  tasks.forEach((t) => {
    if (t.phase !== currentPhase) {
      currentPhase = t.phase;
      console.log(`\x1b[1m\x1b[35m${currentPhase}\x1b[0m`);
    }

    const check = t.completed ? "\x1b[32m[✓]\x1b[0m" : "\x1b[33m[ ]\x1b[0m";
    const statusColor = t.completed ? "\x1b[90m" : "\x1b[37m";
    console.log(`  ${check} \x1b[1m${t.id}\x1b[0m: ${statusColor}${t.title}\x1b[0m \x1b[90m(${t.category})\x1b[0m`);
  });

  console.log("\n\x1b[90mTips: Jalankan 'node scripts/cli.js next' untuk melihat task berikutnya.\x1b[0m\n");
}

function handleNext(tasks) {
  printHeader();
  const nextTask = tasks.find((t) => !t.completed);

  if (!nextTask) {
    console.log("\x1b[32m🎉 SEMUA TASK TELAH SELESAI! Selamat, aplikasi Anda siap rilis.\x1b[0m\n");
    return;
  }

  console.log(`\x1b[1m\x1b[33m🎯 TASK BERIKUTNYA:\x1b[0m \x1b[1m${nextTask.id} - ${nextTask.title}\x1b[0m`);
  console.log(`\x1b[90mFase:\x1b[0m ${nextTask.phase}`);
  console.log(`\x1b[90mKategori:\x1b[0m ${nextTask.category}`);
  if (nextTask.targetFiles.length > 0) {
    console.log(`\x1b[90mFile Target:\x1b[0m ${nextTask.targetFiles.join(", ")}`);
  }
  console.log(`\x1b[90mDeskripsi:\x1b[0m ${nextTask.description}\n`);

  if (nextTask.aiPrompt) {
    console.log("\x1b[36m--- [ SALIN PROMPT INI KE AI CODING AGENT (CURSOR / CLAUDE / ANTIGRAVITY) ] ---\x1b[0m");
    console.log(nextTask.aiPrompt);
    console.log("\x1b[36m--------------------------------------------------------------------------------\x1b[0m\n");
  }

  if (nextTask.acceptanceCriteria) {
    console.log(`\x1b[32mKriteria Selesai:\x1b[0m ${nextTask.acceptanceCriteria}\n`);
  }

  console.log(`\x1b[90mSetelah AI selesai coding, tandai task ini selesai dengan:\x1b[0m`);
  console.log(`  \x1b[1mnode scripts/cli.js done ${nextTask.id}\x1b[0m\n`);
}

function handleDone(tasks, taskId, tasksFilePath) {
  if (!taskId) {
    console.log("\x1b[31mError: Harap sebutkan Task ID (contoh: TASK-01)\x1b[0m");
    return;
  }

  const normalizedId = taskId.toUpperCase();
  const task = tasks.find((t) => t.id === normalizedId);

  if (!task) {
    console.log(`\x1b[31mError: Task ${normalizedId} tidak ditemukan.\x1b[0m`);
    return;
  }

  let content = fs.readFileSync(tasksFilePath, "utf8");
  const regex = new RegExp(`###\\s*\\[([ ])\\]\\s*${normalizedId}:`);

  if (!regex.test(content)) {
    if (new RegExp(`###\\s*\\[[xX]\\]\\s*${normalizedId}:`).test(content)) {
      console.log(`\x1b[33mTask ${normalizedId} sudah berstatus selesai sebelumnya.\x1b[0m`);
      return;
    }
    console.log(`\x1b[31mGagal mencocokkan pattern task di berkas.\x1b[0m`);
    return;
  }

  content = content.replace(regex, `### [x] ${normalizedId}:`);
  fs.writeFileSync(tasksFilePath, content, "utf8");

  console.log(`\x1b[32m✓ Berhasil! Task ${normalizedId} (${task.title}) ditandai SELESAI.\x1b[0m`);
  console.log(`Jalankan 'node scripts/cli.js next' untuk melihat task berikutnya.\n`);
}

function handlePrompt(tasks, taskId) {
  if (!taskId) {
    console.log("\x1b[31mError: Harap sebutkan Task ID (contoh: TASK-01)\x1b[0m");
    return;
  }
  const task = tasks.find((t) => t.id === taskId.toUpperCase());
  if (!task) {
    console.log(`\x1b[31mTask ${taskId} tidak ditemukan.\x1b[0m`);
    return;
  }
  if (!task.aiPrompt) {
    console.log(`\x1b[33mTidak ada prompt AI eksplisit untuk ${taskId}.\x1b[0m`);
    return;
  }
  console.log(task.aiPrompt);
}

function main() {
  const args = process.argv.slice(2);
  let command = args[0] || "next";
  let subArg = args[1];

  if (command === "task") {
    command = subArg || "next";
    subArg = args[2];
  }

  const tasksFilePath = findTasksFile();

  if (!fs.existsSync(tasksFilePath)) {
    // Generate a default tasks.md if it doesn't exist
    const defaultTemplate = `# Actionable AI Execution Tasks
## Fase 1: Fondasi Skema Database & Storage
### [ ] TASK-01: Migrasi DDL Tabel PostgreSQL Neon
- **Kategori:** Database
- **File Target:** scripts/migrate.js, src/lib/neon/db.ts
- **Deskripsi:** Siapkan tabel utama sesuai dengan spesifikasi database_schema.md.
- **Prompt Eksekusi AI:**
\`\`\`markdown
Bertindaklah sebagai Database Engineer. Buat skrip migrasi DDL untuk aplikasi menggunakan driver @neondatabase/serverless.
\`\`\`
- **Kriteria Selesai:** Eksekusi skrip migrasi sukses tanpa error.
`;
    fs.writeFileSync(tasksFilePath, defaultTemplate, "utf8");
  }

  const content = fs.readFileSync(tasksFilePath, "utf8");
  const tasks = parseTasksFromMarkdown(content);

  switch (command) {
    case "list":
    case "ls":
      handleList(tasks);
      break;
    case "next":
      handleNext(tasks);
      break;
    case "done":
    case "check":
      handleDone(tasks, subArg, tasksFilePath);
      break;
    case "prompt":
      handlePrompt(tasks, subArg);
      break;
    case "help":
    default:
      printHeader();
      console.log("Perintah CLI yang didukung:");
      console.log("  node scripts/cli.js list            - Tampilkan seluruh task dan progres");
      console.log("  node scripts/cli.js next            - Tampilkan task berikutnya + prompt AI");
      console.log("  node scripts/cli.js done <TASK_ID>  - Tandai task selesai (contoh: TASK-01)");
      console.log("  node scripts/cli.js prompt <TASK_ID>- Cetak prompt AI murni untuk task tertentu\n");
      break;
  }
}

main();
