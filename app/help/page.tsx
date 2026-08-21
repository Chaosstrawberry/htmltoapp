import type { Metadata } from 'next'
import { Header } from '@/components/header'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata: Metadata = {
  title: 'Get Help — HTML → App Builder',
  description: 'Frequently asked questions about building desktop apps and installers from HTML.',
}

const FAQ = [
  {
    q: 'Why is my build not working?',
    a: 'The most common cause is that Node.js is not installed. Every build script checks for Node.js first and prints a clear message if it is missing. Install Node.js 18+ from nodejs.org, reopen your terminal (or restart the .bat), and run the script again. Also make sure you extracted the ZIP fully before running — running the script from inside the ZIP viewer will fail.',
  },
  {
    q: 'Why do I need Node.js?',
    a: 'The generated project uses Electron and electron-builder, which run on Node.js. The web app only generates the project files; the actual native app is compiled locally on your machine by these tools. This keeps your HTML code private and lets you rebuild any time without re-uploading.',
  },
  {
    q: 'How do I change the app icon?',
    a: 'In the Installer Options step, upload a PNG, ICO or SVG (256×256 or larger recommended). It gets bundled into the project and referenced by electron-builder for the app, installer and shortcuts. If you do not upload one, a default icon is used so the build still succeeds. To change it later, replace the file in the icons/ folder of the generated project.',
  },
  {
    q: 'How do I change the start file?',
    a: 'Your main HTML file does not need to be named index.html. In the Upload step, use the "Start HTML file" selector to choose any detected HTML file (for example main.html or game.html). The selected entry is written into config/app-config.json and loaded by Electron on launch.',
  },
  {
    q: 'Why does the macOS build not work on Windows?',
    a: 'Apple requires that .app bundles, DMG images and code signing be produced on macOS. electron-builder cannot cross-build a proper signed macOS app from Windows or Linux. The generated package still includes build-macos.sh and full instructions so you (or a CI runner) can build it on a Mac.',
  },
  {
    q: 'Can I build Windows apps on Linux or macOS?',
    a: 'You can produce a Windows build from other platforms with electron-builder in many cases, but for a reliable NSIS installer and correct icons, building on Windows is recommended. The generated build-windows.bat is designed for Windows.',
  },
  {
    q: 'Where does my uploaded HTML go?',
    a: 'Nowhere — everything happens in your browser. Files are parsed client-side and the ZIP is assembled in-memory, then downloaded directly to you. Nothing is stored on a server, which is why you can safely package private projects.',
  },
  {
    q: 'What is the App ID and why does it matter?',
    a: 'The App ID is a reverse-DNS identifier (e.g. com.yourcompany.yourapp) that uniquely identifies your application to the operating system for installation, updates and shortcuts. It must not be empty and should only contain letters, numbers, dots and hyphens.',
  },
  {
    q: 'How do I run the build after downloading?',
    a: 'Extract the ZIP, open the folder, then: on Windows double-click build-windows.bat; on Linux run "chmod +x build-linux.sh && ./build-linux.sh"; on macOS run "chmod +x build-macos.sh && ./build-macos.sh". Your installer/app appears in the dist/ folder.',
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-svh bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">Get Help</h1>
          <p className="mt-2 text-muted-foreground text-pretty">
            Answers to the most common questions about packaging HTML into desktop apps and
            installers.
          </p>
        </header>

        <Accordion type="single" collapsible className="w-full">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
    </div>
  )
}
