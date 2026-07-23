import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from './firebase';
import { Book, Member, Borrowing, Visitor } from '../types';
import { 
  INITIAL_BOOKS, 
  INITIAL_MEMBERS, 
  INITIAL_BORROWINGS, 
  INITIAL_VISITORS 
} from '../data/mockData';

// Track initial seed status to avoid re-seeding
let isBooksSeeded = false;
let isMembersSeeded = false;
let isBorrowingsSeeded = false;
let isVisitorsSeeded = false;

// Helper to seed from localStorage or INITIAL fallback
function getLocalOrInitial<T>(key: string, fallback: T): T {
  try {
    const local = localStorage.getItem(key);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as T;
      }
    }
  } catch (e) {
    console.error(`Failed reading ${key} from localStorage`, e);
  }
  return fallback;
}

// 1. BOOKS SUBSCRIPTION & MUTATIONS
export function subscribeBooks(onData: (books: Book[]) => void) {
  const colRef = collection(db, 'books');
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !isBooksSeeded) {
      isBooksSeeded = true;
      const seedBooks = getLocalOrInitial('rk_makmur_books', INITIAL_BOOKS);
      for (const book of seedBooks) {
        await setDoc(doc(db, 'books', book.kodeBuku), book);
      }
      return;
    }
    const booksList: Book[] = [];
    snapshot.forEach((docSnap) => {
      booksList.push(docSnap.data() as Book);
    });
    onData(booksList);
  }, (err) => {
    console.error("Firestore Subscribe Books Error:", err);
  });
}

export async function saveBookToCloud(book: Book, oldKodeBuku?: string) {
  if (oldKodeBuku && oldKodeBuku !== book.kodeBuku) {
    await deleteDoc(doc(db, 'books', oldKodeBuku));
  }
  await setDoc(doc(db, 'books', book.kodeBuku), book);
}

export async function deleteBookFromCloud(kodeBuku: string) {
  await deleteDoc(doc(db, 'books', kodeBuku));
}

// 2. MEMBERS SUBSCRIPTION & MUTATIONS
export function subscribeMembers(onData: (members: Member[]) => void) {
  const colRef = collection(db, 'members');
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !isMembersSeeded) {
      isMembersSeeded = true;
      const seedMembers = getLocalOrInitial('rk_makmur_members', INITIAL_MEMBERS);
      for (const member of seedMembers) {
        await setDoc(doc(db, 'members', member.nomorAnggota), member);
      }
      return;
    }
    const membersList: Member[] = [];
    snapshot.forEach((docSnap) => {
      membersList.push(docSnap.data() as Member);
    });
    onData(membersList);
  }, (err) => {
    console.error("Firestore Subscribe Members Error:", err);
  });
}

export async function saveMemberToCloud(member: Member, oldNomorAnggota?: string) {
  if (oldNomorAnggota && oldNomorAnggota !== member.nomorAnggota) {
    await deleteDoc(doc(db, 'members', oldNomorAnggota));
  }
  await setDoc(doc(db, 'members', member.nomorAnggota), member);
}

export async function deleteMemberFromCloud(nomorAnggota: string) {
  await deleteDoc(doc(db, 'members', nomorAnggota));
}

// 3. BORROWINGS SUBSCRIPTION & MUTATIONS
export function subscribeBorrowings(onData: (borrowings: Borrowing[]) => void) {
  const colRef = collection(db, 'borrowings');
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !isBorrowingsSeeded) {
      isBorrowingsSeeded = true;
      const seedBorrowings = getLocalOrInitial('rk_makmur_borrowings', INITIAL_BORROWINGS);
      for (const borrowing of seedBorrowings) {
        await setDoc(doc(db, 'borrowings', borrowing.id), borrowing);
      }
      return;
    }
    const borrowingsList: Borrowing[] = [];
    snapshot.forEach((docSnap) => {
      borrowingsList.push(docSnap.data() as Borrowing);
    });
    onData(borrowingsList);
  }, (err) => {
    console.error("Firestore Subscribe Borrowings Error:", err);
  });
}

export async function saveBorrowingToCloud(borrowing: Borrowing) {
  await setDoc(doc(db, 'borrowings', borrowing.id), borrowing);
}

export async function saveBatchBorrowingsToCloud(borrowings: Borrowing[]) {
  for (const item of borrowings) {
    await setDoc(doc(db, 'borrowings', item.id), item);
  }
}

export async function deleteBorrowingFromCloud(id: string) {
  await deleteDoc(doc(db, 'borrowings', id));
}

// 4. VISITORS SUBSCRIPTION & MUTATIONS
export function subscribeVisitors(onData: (visitors: Visitor[]) => void) {
  const colRef = collection(db, 'visitors');
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !isVisitorsSeeded) {
      isVisitorsSeeded = true;
      const seedVisitors = getLocalOrInitial('rk_makmur_visitors', INITIAL_VISITORS);
      for (const visitor of seedVisitors) {
        await setDoc(doc(db, 'visitors', visitor.id), visitor);
      }
      return;
    }
    const visitorsList: Visitor[] = [];
    snapshot.forEach((docSnap) => {
      visitorsList.push(docSnap.data() as Visitor);
    });
    onData(visitorsList);
  }, (err) => {
    console.error("Firestore Subscribe Visitors Error:", err);
  });
}

export async function saveVisitorToCloud(visitor: Visitor) {
  await setDoc(doc(db, 'visitors', visitor.id), visitor);
}

export async function deleteVisitorFromCloud(id: string) {
  await deleteDoc(doc(db, 'visitors', id));
}

// 5. ADMIN NAME SETTINGS SUBSCRIPTION & MUTATION
export function subscribeAdminName(onData: (adminName: string) => void) {
  const docRef = doc(db, 'settings', 'adminConfig');
  return onSnapshot(docRef, async (docSnap) => {
    if (!docSnap.exists()) {
      const defaultName = localStorage.getItem('rk_makmur_admin_name') || 'Administrator RK Makmur';
      await setDoc(docRef, { adminName: defaultName });
      onData(defaultName);
    } else {
      const data = docSnap.data();
      onData(data?.adminName || 'Administrator RK Makmur');
    }
  }, (err) => {
    console.error("Firestore Subscribe Admin Config Error:", err);
  });
}

export async function saveAdminNameToCloud(adminName: string) {
  await setDoc(doc(db, 'settings', 'adminConfig'), { adminName });
}

// 6. FORCE RESTORE ALL INITIAL SAMPLE DATA TO CLOUD
export async function restoreInitialDataToCloud() {
  for (const book of INITIAL_BOOKS) {
    await setDoc(doc(db, 'books', book.kodeBuku), book);
  }
  for (const member of INITIAL_MEMBERS) {
    await setDoc(doc(db, 'members', member.nomorAnggota), member);
  }
  for (const borrowing of INITIAL_BORROWINGS) {
    await setDoc(doc(db, 'borrowings', borrowing.id), borrowing);
  }
  for (const visitor of INITIAL_VISITORS) {
    await setDoc(doc(db, 'visitors', visitor.id), visitor);
  }
  await setDoc(doc(db, 'settings', 'adminConfig'), { adminName: 'Administrator RK Makmur' });
}

// 7. SYNC LOCAL STORAGE TO CLOUD
export async function syncLocalStorageToCloud() {
  try {
    const localBooksStr = localStorage.getItem('rk_makmur_books');
    if (localBooksStr) {
      const books: Book[] = JSON.parse(localBooksStr);
      for (const b of books) {
        await setDoc(doc(db, 'books', b.kodeBuku), b);
      }
    }

    const localMembersStr = localStorage.getItem('rk_makmur_members');
    if (localMembersStr) {
      const members: Member[] = JSON.parse(localMembersStr);
      for (const m of members) {
        await setDoc(doc(db, 'members', m.nomorAnggota), m);
      }
    }

    const localBorrowingsStr = localStorage.getItem('rk_makmur_borrowings');
    if (localBorrowingsStr) {
      const borrowings: Borrowing[] = JSON.parse(localBorrowingsStr);
      for (const br of borrowings) {
        await setDoc(doc(db, 'borrowings', br.id), br);
      }
    }

    const localVisitorsStr = localStorage.getItem('rk_makmur_visitors');
    if (localVisitorsStr) {
      const visitors: Visitor[] = JSON.parse(localVisitorsStr);
      for (const v of visitors) {
        await setDoc(doc(db, 'visitors', v.id), v);
      }
    }

    const localAdmin = localStorage.getItem('rk_makmur_admin_name');
    if (localAdmin) {
      await saveAdminNameToCloud(localAdmin);
    }
    return true;
  } catch (err) {
    console.error("Failed to sync local storage to cloud:", err);
    return false;
  }
}
