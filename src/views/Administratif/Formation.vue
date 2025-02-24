<template>
  <div>
    <h1>Gestion des Formations (Admin)</h1>

    <!-- Section : Ajouter Formation -->
    <section>
      <h2>Ajouter Formation</h2>
      <input v-model="newFormation.nom" placeholder="Nom de la formation" />
      <input v-model="newFormation.annee" placeholder="Année" />
      <button @click="onAddFormation">Ajouter Formation</button>
    </section>

    <!-- Liste des Formations -->
    <section v-if="formations && formations.length">
      <h2>Formations</h2>
      <div v-for="formation in formations" :key="formation.uid" class="formation-group">
        <details>
          <summary>
            {{ formation.nom }} ({{ formation.annee }})
            <button @click.stop="startEditingFormation(formation)">Modifier</button>
            <button @click.stop="onDeleteFormation(formation.uid)">Supprimer</button>
          </summary>
          <!-- Formulaire de modification de Formation -->
          <div v-if="editingFormation && editingFormation.uid === formation.uid">
            <input v-model="editingFormation.nom" placeholder="Nom" />
            <input v-model="editingFormation.annee" placeholder="Année" />
            <button @click="onUpdateFormation">Enregistrer</button>
            <button @click="cancelEditingFormation">Annuler</button>
          </div>
          <!-- Section des Cours de la Formation -->
          <div class="courses-section">
            <h3>Cours</h3>
            <div
                v-for="course in getCoursesForFormation(formation)"
                :key="course.uid"
                class="course-group"
            >
              <details @toggle="handleCourseToggle(course.uid, $event)">
                <summary>
                  {{ course.nom }} - Enseignant : {{ course.id_enseignant }}
                  <button @click.stop="startEditingCours(course)">Modifier</button>
                  <button @click.stop="onDeleteCours(course.uid)">Supprimer</button>
                </summary>
                <!-- Formulaire de modification du cours -->
                <div v-if="editingCours && editingCours.uid === course.uid">
                  <input v-model="editingCours.nom" placeholder="Nom du cours" />
                  <input
                      v-model="editingCours.id_enseignant"
                      placeholder="ID de l'intervenant"
                  />
                  <button @click="onUpdateCours">Enregistrer</button>
                  <button @click="cancelEditingCours">Annuler</button>
                </div>
                <!-- Section des Séances pour le cours -->
                <div class="seances-section">
                  <h4>Séances</h4>
                  <div v-if="loadingSeances[course.uid]">
                    Chargement des séances...
                  </div>
                  <div v-else>
                    <div
                        v-for="seance in getSeancesForCourse(course.uid)"
                        :key="seance.uid"
                        class="seance-item"
                    >
                      <p>
                        {{ formatDate(seance.date) }} - {{ formatTime(seance.date) }}
                        à {{ formatTime(seance.date_fin) }} - {{ seance.lieu }}
                        <button @click="onDeleteSeance(seance.uid, course.uid)">
                          Supprimer
                        </button>
                      </p>
                    </div>
                    <!-- Formulaire pour ajouter une séance -->
                    <div class="add-seance">
                      <input v-model="newSeance.date" type="date" placeholder="Date" />
                      <input
                          v-model="newSeance.date"
                          type="time"
                          placeholder="Heure Début"
                      />
                      <input
                          v-model="newSeance.date_fin"
                          type="time"
                          placeholder="Heure fin"
                      />
                      <input v-model="newSeance.lieu" placeholder="Lieu" />
                      <button @click="onAddSeance(course.uid)">Ajouter Séance</button>
                    </div>
                  </div>
                </div>
              </details>
            </div>
            <!-- Formulaire pour ajouter un cours à la formation -->
            <div class="add-course">
              <input v-model="newCours.nom" placeholder="Nom du cours" />
              <input
                  v-model="newCours.id_enseignant"
                  placeholder="ID de l'intervenant"
              />
              <button @click="onAddCours(formation.uid)">Ajouter Cours</button>
            </div>
          </div>
        </details>
      </div>
    </section>
    <div v-else>
      <p>Aucune formation disponible.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFormationStore } from '@/stores/formation.store';
import { useCoursStore } from '@/stores/cours.store';
import { useSeanceStore } from '@/stores/seance.store';
import type { Formation } from '@/entities/formation';
import type { Cours } from '@/entities/cours';
import type { SeanceEntity } from '@/entities/seance';

const formationStore = useFormationStore();
const coursStore = useCoursStore();
const seanceStore = useSeanceStore();

const { formations, fetchFormations, addFormation, updateFormation, deleteFormation } =
    formationStore;
const { courses, fetchCourses, addCours, updateCours, deleteCours } = coursStore;
const { seances, fetchSeancesForCourse, addSeance, deleteSeance } = seanceStore;

const newFormation = ref<Pick<Formation, 'nom' | 'annee'>>({ nom: '', annee: '' });
const editingFormation = ref<Formation | null>(null);

const newCours = ref<Pick<Cours, 'nom' | 'id_enseignant'>>({ nom: '', id_enseignant: '' });
const editingCours = ref<Cours | null>(null);

const newSeance = ref({ date: '', date_fin: '', lieu: '' });

const seancesByCourse = ref<Record<string, SeanceEntity[]>>({});
const loadingSeances = ref<Record<string, boolean>>({});

// Fonctions de formatage
function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString();
}

// Fonctions Formation
function startEditingFormation(formation: Formation) {
  editingFormation.value = { ...formation };
}
function cancelEditingFormation() {
  editingFormation.value = null;
}
async function onUpdateFormation() {
  if (editingFormation.value) {
    await updateFormation(editingFormation.value);
    editingFormation.value = null;
    await fetchFormations();
  }
}
async function onDeleteFormation(formationId: string) {
  await deleteFormation(formationId);
  await fetchFormations();
}
async function onAddFormation() {
  await addFormation(newFormation.value as Formation);
  newFormation.value = { nom: '', annee: '' };
  await fetchFormations();
}

// Fonctions Cours
function getCoursesForFormation(formation: Formation): Cours[] {
  return courses.filter((course: Cours) => formation.cours.includes(course.uid));
}
function startEditingCours(cours: Cours) {
  editingCours.value = { ...cours };
}
function cancelEditingCours() {
  editingCours.value = null;
}
async function onUpdateCours() {
  if (editingCours.value) {
    await updateCours(editingCours.value);
    editingCours.value = null;
    await fetchCourses();
    await fetchFormations();
  }
}
async function onDeleteCours(coursId: string) {
  await deleteCours(coursId);
  await fetchCourses();
  await fetchFormations();
}
async function onAddCours(formationId: string) {
  await addCours(newCours.value as Cours);
  newCours.value = { nom: '', id_enseignant: '' };
  await fetchCourses();
  await fetchFormations();
}

// Fonctions Séance
async function loadSeances(courseId: string) {
  loadingSeances.value[courseId] = true;
  await fetchSeancesForCourse(courseId);
  seancesByCourse.value[courseId] = seances.filter(
      (seance: SeanceEntity) => seance.id_cours === courseId
  );
  loadingSeances.value[courseId] = false;
}
function getSeancesForCourse(courseId: string): SeanceEntity[] {
  return seancesByCourse.value[courseId] || [];
}

function handleCourseToggle(courseId: string, event: Event) {
  const details = event.target as HTMLDetailsElement;
  if (details.open && !seancesByCourse.value[courseId]) {
    loadSeances(courseId);
  }
}
async function onDeleteSeance(seanceId: string, courseId: string) {
  await deleteSeance(seanceId, courseId);
  await loadSeances(courseId);
}
async function onAddSeance(courseId: string) {
  if (newSeance.value.date && newSeance.value.date && newSeance.value.date_fin && newSeance.value.lieu) {
    const seanceObj: SeanceEntity = {
      uid: '',
      date: new Date(newSeance.value.date),
      date_fin: new Date(newSeance.value.date_fin),
      id_cours: courseId,
      lieu: newSeance.value.lieu,
      presences: []
    };
    await addSeance(seanceObj);
    newSeance.value = { date: '', date_fin: '', lieu: '' };
    await loadSeances(courseId);
  }
}

onMounted(async () => {
  await fetchFormations();
  await fetchCourses(); // Charge tous les cours pour l'administration
});
</script>

<style scoped>
.formation-group {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.course-group {
  margin-left: 1rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #eee;
}
.seances-section {
  margin-left: 1rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.add-seance,
.add-course {
  margin-top: 0.5rem;
}
</style>
