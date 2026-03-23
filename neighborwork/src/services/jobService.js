// src/services/jobService.js
import {
  collection, addDoc, getDocs, getDoc, doc,
  updateDoc, query, where, orderBy, serverTimestamp, arrayUnion
} from "firebase/firestore";
import { db } from "../firebase";

// ─── JOBS ────────────────────────────────────────────────────────────────────

export const createJob = async (userId, jobData) => {
  const ref = await addDoc(collection(db, "jobs"), {
    ...jobData,
    postedBy: userId,
    interestedUsers: [],
    status: "open",
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getAllJobs = async (filters = {}) => {
  let q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));

  if (filters.type) {
    q = query(collection(db, "jobs"), where("type", "==", filters.type), orderBy("createdAt", "desc"));
  }
  if (filters.category) {
    q = query(collection(db, "jobs"), where("category", "==", filters.category), orderBy("createdAt", "desc"));
  }

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getJobById = async (jobId) => {
  const snap = await getDoc(doc(db, "jobs", jobId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const expressInterest = async (jobId, userId) => {
  await updateDoc(doc(db, "jobs", jobId), {
    interestedUsers: arrayUnion(userId),
  });
};

export const updateJobStatus = async (jobId, status) => {
  await updateDoc(doc(db, "jobs", jobId), { status });
};

export const getJobsByUser = async (userId) => {
  const q = query(collection(db, "jobs"), where("postedBy", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── USERS ───────────────────────────────────────────────────────────────────

export const getUserById = async (userId) => {
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const updateUserProfile = async (userId, data) => {
  await updateDoc(doc(db, "users", userId), data);
};

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

export const addReview = async (reviewData) => {
  // reviewData: { jobId, reviewerId, revieweeId, stars, comment }
  await addDoc(collection(db, "reviews"), {
    ...reviewData,
    createdAt: serverTimestamp(),
  });

  // Update reviewee's average rating
  const reviewsSnap = await getDocs(
    query(collection(db, "reviews"), where("revieweeId", "==", reviewData.revieweeId))
  );
  const reviews = reviewsSnap.docs.map((d) => d.data());
  const avg = reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length;

  await updateDoc(doc(db, "users", reviewData.revieweeId), {
    rating: Math.round(avg * 10) / 10,
    reviewCount: reviews.length,
  });
};

export const getReviewsForUser = async (userId) => {
  const q = query(collection(db, "reviews"), where("revieweeId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
