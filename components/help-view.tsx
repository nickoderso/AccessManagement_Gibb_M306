"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, Info, Book, MessageSquare } from "lucide-react"

export function HelpView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <HelpCircle className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Hilfe & Dokumentation</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Über diese Anwendung</CardTitle>
          <CardDescription>
            Active Directory Permissions Manager - Ein Tool zur Verwaltung von Organisationsstrukturen und
            Berechtigungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Diese Anwendung ermöglicht es Ihnen, Ihre Organisationsstruktur zu visualisieren und zu verwalten, sowie
            Berechtigungen für Benutzer zu definieren und zuzuweisen. Alle Daten werden lokal in Ihrem Browser
            gespeichert.
          </p>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Version 1.0.0</span>
          </div>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-base font-medium">Erste Schritte</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
            <p>Um mit der Anwendung zu beginnen, folgen Sie diesen Schritten:</p>
            <ol className="list-decimal list-inside space-y-2 pl-2">
              <li>Fügen Sie ein Unternehmen hinzu, indem Sie auf "Unternehmen hinzufügen" klicken.</li>
              <li>
                Erweitern Sie das Unternehmen und fügen Sie Tochterunternehmen, Abteilungen, Teams und Mitarbeiter
                hinzu.
              </li>
              <li>Bearbeiten Sie Mitarbeiter, um ihnen Rollen und Berechtigungen zuzuweisen.</li>
              <li>Verwenden Sie die Suchfunktion, um schnell bestimmte Elemente zu finden.</li>
              <li>Nutzen Sie Drag & Drop, um Elemente in der Hierarchie zu verschieben.</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-base font-medium">Organisationsstruktur verwalten</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
            <p>Die Organisationsstruktur ist hierarchisch aufgebaut:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                <strong>Unternehmen</strong>: Die oberste Ebene der Organisation.
              </li>
              <li>
                <strong>Tochterunternehmen</strong>: Untergeordnete Unternehmen oder Geschäftsbereiche.
              </li>
              <li>
                <strong>Abteilungen</strong>: Funktionale Einheiten innerhalb eines Unternehmens.
              </li>
              <li>
                <strong>Teams</strong>: Arbeitsgruppen innerhalb einer Abteilung.
              </li>
              <li>
                <strong>Mitarbeiter</strong>: Einzelne Personen innerhalb eines Teams.
              </li>
            </ul>
            <p className="mt-3">
              Sie können Elemente hinzufügen, bearbeiten oder löschen, indem Sie die entsprechenden Schaltflächen
              verwenden. Zum Verschieben eines Elements ziehen Sie es einfach per Drag & Drop an die gewünschte
              Position.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="text-base font-medium">Berechtigungen verwalten</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
            <p>Berechtigungen können Mitarbeitern zugewiesen werden:</p>
            <ol className="list-decimal list-inside space-y-2 pl-2">
              <li>Bearbeiten Sie einen Mitarbeiter, indem Sie auf das Bearbeiten-Symbol klicken.</li>
              <li>Wechseln Sie zum Tab "Berechtigungen".</li>
              <li>Wählen Sie die gewünschten Berechtigungen aus der Liste aus.</li>
              <li>Sie können auch neue Berechtigungen erstellen, indem Sie auf "Neue Berechtigung" klicken.</li>
            </ol>
            <p className="mt-3">
              Berechtigungen sind in Kategorien unterteilt, um die Verwaltung zu erleichtern. Sie können alle
              Berechtigungen im Bereich "Berechtigungen" der Anwendung verwalten.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger className="text-base font-medium">Benutzer kopieren</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
            <p>Sie können Benutzer mit allen zugewiesenen Berechtigungen kopieren:</p>
            <ol className="list-decimal list-inside space-y-2 pl-2">
              <li>Klicken Sie auf das Dreipunkt-Menü neben einem Mitarbeiter und wählen Sie "Kopieren".</li>
              <li>Alternativ können Sie in der Benutzeransicht auf das Kopieren-Symbol klicken.</li>
              <li>Geben Sie einen Namen und optional eine Rolle für den neuen Benutzer ein.</li>
              <li>Der neue Benutzer wird mit allen Berechtigungen des Originals erstellt.</li>
              <li>Sie können auch in der Berechtigungsvergleichsansicht Benutzer kopieren.</li>
            </ol>
            <p className="mt-3">
              Diese Funktion ist besonders nützlich, wenn Sie mehrere Benutzer mit ähnlichen Berechtigungen erstellen
              möchten.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger className="text-base font-medium">Daten sichern und wiederherstellen</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
            <p>
              Alle Daten werden automatisch im lokalen Speicher Ihres Browsers gesichert. Um Ihre Daten zu sichern oder
              auf ein anderes Gerät zu übertragen:
            </p>
            <ol className="list-decimal list-inside space-y-2 pl-2">
              <li>Gehen Sie zu "Einstellungen".</li>
              <li>Klicken Sie auf "Daten exportieren", um eine JSON-Datei mit allen Daten herunterzuladen.</li>
              <li>Verwenden Sie "Daten importieren", um zuvor exportierte Daten wiederherzustellen.</li>
            </ol>
            <p className="mt-3">
              Sie können auch alle Daten zurücksetzen, indem Sie auf "Zurücksetzen" klicken. Beachten Sie, dass dieser
              Vorgang nicht rückgängig gemacht werden kann.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-center space-x-6 mt-8">
        <div className="flex flex-col items-center">
          <Book className="h-8 w-8 text-primary mb-2" />
          <span className="text-sm font-medium">Dokumentation</span>
        </div>
        <div className="flex flex-col items-center">
          <MessageSquare className="h-8 w-8 text-primary mb-2" />
          <span className="text-sm font-medium">Support</span>
        </div>
      </div>
    </div>
  )
}
