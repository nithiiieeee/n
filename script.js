const terminalInput = document.querySelector(".terminal-input");
const terminalOutput = document.querySelector(".terminal-output");
const promptUsernames = document.querySelectorAll(".user-prefix");
const siteLogoText = document.querySelector(".site-logo-text");
const heroQuoteElement = document.querySelector(".hero-quote");
const profilePicElement = document.querySelector(".profile-pic");
const fileUploader = document.getElementById("terminal-file-uploader");

const tabTitle = document.getElementById("site-tab-title");
const tabFavicon = document.getElementById("site-tab-favicon");

const FACTORY_DEFAULTS = {
  username: "guest",
  heading: "nithiiieeee",
  quote: `“You are <span class="highlight-red">free</span><br>as long as<br>you realise it”`,
  photo: "nagi.jpg",
  favicon: "nagi.jpg",
};

let currentUser =
  localStorage.getItem("terminalUsername") || FACTORY_DEFAULTS.username;
let currentHeading =
  localStorage.getItem("siteHeading") || FACTORY_DEFAULTS.heading;
let currentQuote = localStorage.getItem("siteQuote") || FACTORY_DEFAULTS.quote;

let isAwaitingUsername = false;
let isAwaitingHeading = false;
let isAwaitingQuote = false;
let isAwaitingReset = false;

function initTerminal() {
  updateVisiblePrompts(currentUser);
  siteLogoText.textContent = currentHeading;
  heroQuoteElement.innerHTML = currentQuote;

  tabTitle.textContent = currentHeading;

  const savedPhoto = localStorage.getItem("sitePhoto");
  if (savedPhoto) {
    profilePicElement.src = savedPhoto;
    tabFavicon.href = savedPhoto;
  } else {
    profilePicElement.src = FACTORY_DEFAULTS.photo;
    tabFavicon.href = FACTORY_DEFAULTS.favicon;
  }
}
initTerminal();

function updateVisiblePrompts(name) {
  promptUsernames.forEach((element) => {
    element.textContent = name;
  });
}

terminalInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const rawInput = terminalInput.value.trim();

    if (rawInput !== "") {
      const echoLine = document.createElement("p");
      echoLine.innerHTML = `<span class="terminal-prompt">${currentUser}@nithiiieeee:~$</span> ${rawInput}`;
      terminalOutput.appendChild(echoLine);
    }

    if (isAwaitingUsername) {
      handleUsernameSubmission(rawInput);
    } else if (isAwaitingHeading) {
      handleHeadingSubmission(rawInput);
    } else if (isAwaitingQuote) {
      handleQuoteSubmission(rawInput);
    } else if (isAwaitingReset) {
      handleResetSubmission(rawInput.toLowerCase());
    } else {
      handleStandardCommand(rawInput.toLowerCase());
    }

    terminalInput.value = "";
    const terminalBody = document.querySelector(".terminal-body");
    if (terminalBody) {
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  }
});

function handleStandardCommand(cmd) {
  if (cmd === "") return;

  isAwaitingUsername = false;
  isAwaitingHeading = false;
  isAwaitingQuote = false;
  isAwaitingReset = false;

  switch (cmd) {
    case "help":
      displayHelpMenu();
      break;

    case "username":
      isAwaitingUsername = true;
      printSystemMessage("Enter new username:");
      break;

    case "heading":
      isAwaitingHeading = true;
      printSystemMessage("Enter new website heading:");
      break;

    case "quote":
      isAwaitingQuote = true;
      printSystemMessage(
        "Enter your favorite quote. Use <word> to color it red:",
      );
      break;

    case "photo":
      printSystemMessage(
        "Opening device file system selection window...",
        "text-muted",
      );
      fileUploader.click();
      break;

    case "reset":
      isAwaitingReset = true;
      printSystemMessage(
        "What do you want to reset? Options: [username, heading, quote, photo, all]",
      );
      break;

    default:
      printSystemMessage(`command not found: ${cmd}`, "text-error");
  }
}

fileUploader.addEventListener("change", function () {
  const selectedFile = fileUploader.files[0];
  if (selectedFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64ImageString = e.target.result;
      try {
        localStorage.setItem("sitePhoto", base64ImageString);

        profilePicElement.src = base64ImageString;
        tabFavicon.href = base64ImageString;

        printSystemMessage(
          "Profile photo and favicon successfully updated.",
          "text-success",
        );
      } catch (error) {
        printSystemMessage(
          "File size too large for browser cache. Try a smaller image file.",
          "text-error",
        );
      }
    };
    reader.readAsDataURL(selectedFile);
  }
});

function handleResetSubmission(choice) {
  isAwaitingReset = false;

  if (choice === "") {
    printSystemMessage("Reset action canceled.", "text-muted");
    return;
  }

  switch (choice) {
    case "username":
      localStorage.removeItem("terminalUsername");
      currentUser = FACTORY_DEFAULTS.username;
      updateVisiblePrompts(currentUser);
      printSystemMessage(
        "Username has been reverted to default.",
        "text-success",
      );
      break;

    case "heading":
      localStorage.removeItem("siteHeading");
      currentHeading = FACTORY_DEFAULTS.heading;
      siteLogoText.textContent = currentHeading;
      tabTitle.textContent = currentHeading;
      printSystemMessage(
        "Website heading has been reverted to default.",
        "text-success",
      );
      break;

    case "quote":
      localStorage.removeItem("siteQuote");
      currentQuote = FACTORY_DEFAULTS.quote;
      heroQuoteElement.innerHTML = currentQuote;
      printSystemMessage(
        "Main hero quote has been reverted to default.",
        "text-success",
      );
      break;

    case "photo":
      localStorage.removeItem("sitePhoto");
      profilePicElement.src = FACTORY_DEFAULTS.photo;
      tabFavicon.href = FACTORY_DEFAULTS.favicon;
      printSystemMessage(
        "Profile photo and favicon reverted to default.",
        "text-success",
      );
      break;

    case "all":
      localStorage.clear();

      currentUser = FACTORY_DEFAULTS.username;
      currentHeading = FACTORY_DEFAULTS.heading;
      currentQuote = FACTORY_DEFAULTS.quote;

      updateVisiblePrompts(currentUser);
      siteLogoText.textContent = currentHeading;
      heroQuoteElement.innerHTML = currentQuote;
      profilePicElement.src = FACTORY_DEFAULTS.photo;
      tabFavicon.href = FACTORY_DEFAULTS.favicon;
      tabTitle.textContent = FACTORY_DEFAULTS.heading;

      printSystemMessage(
        "System overhaul complete. Entire site restored to factory defaults.",
        "text-success",
      );
      break;

    default:
      printSystemMessage(
        `Invalid target: '${choice}'. Reset process aborted.`,
        "text-error",
      );
  }
}

function handleUsernameSubmission(newName) {
  if (newName === "") {
    printSystemMessage(
      "Username cannot be empty. Setup aborted.",
      "text-muted",
    );
  } else {
    currentUser = newName.replace(/[^a-zA-Z0-9]/g, "");
    localStorage.setItem("terminalUsername", currentUser);
    updateVisiblePrompts(currentUser);
    printSystemMessage(
      `Session user successfully updated to '${currentUser}'.`,
      "text-success",
    );
  }
  isAwaitingUsername = false;
}

function handleHeadingSubmission(newHeadingText) {
  if (newHeadingText === "") {
    printSystemMessage("Heading cannot be empty. Setup aborted.", "text-muted");
  } else {
    currentHeading = newHeadingText;
    localStorage.setItem("siteHeading", currentHeading);

    siteLogoText.textContent = currentHeading;
    tabTitle.textContent = currentHeading;

    printSystemMessage(
      `Website heading successfully updated to '${currentHeading}'.`,
      "text-success",
    );
  }
  isAwaitingHeading = false;
}

function handleQuoteSubmission(rawQuote) {
  if (rawQuote === "") {
    printSystemMessage("Quote cannot be empty. Setup aborted.", "text-muted");
  } else {
    let processedQuote = `“${rawQuote}”`;
    processedQuote = processedQuote.replace(
      /<([^>]+)>/g,
      '<span class="highlight-red">$1</span>',
    );
    currentQuote = processedQuote;
    localStorage.setItem("siteQuote", currentQuote);
    heroQuoteElement.innerHTML = currentQuote;
    printSystemMessage(
      "Website theme quote successfully updated.",
      "text-success",
    );
  }
  isAwaitingQuote = false;
}

function displayHelpMenu() {
  const commandsList = [
    { name: "help", desc: "display all commands" },
    { name: "username", desc: "change your terminal username" },
    { name: "heading", desc: "change the website heading" },
    {
      name: "quote",
      desc: "change the website quote. Put your favorite part inside '<>' to make it red",
    },
    {
      name: "photo",
      desc: "upload and replace profile picture",
    },
    {
      name: "reset",
      desc: "restore defaults for specific zones or everything",
    },
  ];

  printSystemMessage("----------------------------------------", "text-muted");
  commandsList.forEach((item) => {
    const row = document.createElement("div");
    row.className = "terminal-help-row";
    row.innerHTML = `
            <span class="help-cmd">${item.name}</span>
            <span class="help-sep">-</span>
            <span class="help-desc">${item.desc}</span>
        `;
    terminalOutput.appendChild(row);
  });
  printSystemMessage("----------------------------------------", "text-muted");
}

function printSystemMessage(text, className = "system-msg") {
  const msg = document.createElement("p");
  msg.className = className;
  msg.textContent = text;
  terminalOutput.appendChild(msg);
}
