# Web Engineering – Projet Angular 

## Présentation

Une fonctionnalité supplémentaire a été ajoutée : **l’import local d’un calendrier iCalendar (.ics)** afin d’afficher les créneaux déjà occupés comme aide visuelle lors du choix des dates.

---

## Fonctionnalité ajoutée : import ICS

### Objectif

Permettre à l’utilisateur d’importer un fichier **.ics (iCalendar)** depuis son poste afin de :
- lire les événements du calendrier
- identifier les créneaux occupés
- les afficher visuellement dans le calendrier lors de l’étape de sélection des dates

Cette fonctionnalité est **optionnelle**, **locale** et n’impacte pas la création du sondage.

### Intégration

- Étape concernée : **Étape 2 – Choix de la date**
- Un composant dédié permet :
  - la sélection d’un fichier `.ics`
  - l’analyse du contenu
  - la transformation en créneaux occupés
- Les créneaux sont ensuite affichés dans le calendrier FullCalendar

---
![alt text](image.png)

### Installation

```bash
cd front
npm install
npm start
```
