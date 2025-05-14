"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Send,
  GitlabIcon as GitHub,
  Linkedin,
  Twitter,
} from "lucide-react";
import { useNotification } from "@/components/notification-provider";

export function Footer() {
  const [email, setEmail] = useState("");
  const { showNotification } = useNotification();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      showNotification({
        title: "Newsletter abonniert",
        message: `Sie haben den Newsletter mit der E-Mail-Adresse ${email} abonniert.`,
        type: "success",
      });
      setEmail("");
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-secondary border-t border-gray-200 dark:border-gray-700 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Gruppe Gilgen - Access Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Eine moderne Plattform zur Verwaltung und Visualisierung von
              Active Directory-Berechtigungen.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
              >
                <GitHub className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Schnelllinks</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                >
                  Dokumentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                >
                  Datenschutz
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                >
                  Impressum
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Abonnieren Sie unseren Newsletter für Updates und neue Funktionen.
            </p>
            <form onSubmit={handleSubscribe} className="flex">
              <div className="relative flex-grow">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <Input
                  type="email"
                  placeholder="Ihre E-Mail-Adresse"
                  className="pl-10 pr-3 py-2 w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="ml-2">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            &copy; {currentYear} AD Permissions Manager. Alle Rechte
            vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
