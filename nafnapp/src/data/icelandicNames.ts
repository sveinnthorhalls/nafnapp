export interface NameData {
  id: string;
  name: string;
  gender: 'female' | 'male' | 'unisex';
  meaning?: string;
  liked?: {
    user1: boolean | null;
    user2: boolean | null;
  };
}

// Sample list of Icelandic female names
// This is just a starter list - you may want to replace with a more complete list
export const icelandicFemaleNames: NameData[] = [
  { id: '1', name: 'Ásta', gender: 'female', meaning: 'Love, affection', liked: { user1: null, user2: null } },
  { id: '2', name: 'Birna', gender: 'female', meaning: 'She-bear', liked: { user1: null, user2: null } },
  { id: '3', name: 'Dagný', gender: 'female', meaning: 'New day', liked: { user1: null, user2: null } },
  { id: '4', name: 'Embla', gender: 'female', meaning: 'First woman in Norse mythology', liked: { user1: null, user2: null } },
  { id: '5', name: 'Freyja', gender: 'female', meaning: 'Lady, goddess of love', liked: { user1: null, user2: null } },
  { id: '6', name: 'Guðrún', gender: 'female', meaning: 'God\'s secret lore', liked: { user1: null, user2: null } },
  { id: '7', name: 'Hekla', gender: 'female', meaning: 'Hooded', liked: { user1: null, user2: null } },
  { id: '8', name: 'Íris', gender: 'female', meaning: 'Rainbow', liked: { user1: null, user2: null } },
  { id: '9', name: 'Jóhanna', gender: 'female', meaning: 'God is gracious', liked: { user1: null, user2: null } },
  { id: '10', name: 'Katrín', gender: 'female', meaning: 'Pure', liked: { user1: null, user2: null } },
  { id: '11', name: 'Lilja', gender: 'female', meaning: 'Lily', liked: { user1: null, user2: null } },
  { id: '12', name: 'Margrét', gender: 'female', meaning: 'Pearl', liked: { user1: null, user2: null } },
  { id: '13', name: 'Nanna', gender: 'female', meaning: 'Bold, daring', liked: { user1: null, user2: null } },
  { id: '14', name: 'Ólöf', gender: 'female', meaning: 'Ancestor\'s relic', liked: { user1: null, user2: null } },
  { id: '15', name: 'Petra', gender: 'female', meaning: 'Rock', liked: { user1: null, user2: null } },
  { id: '16', name: 'Rakel', gender: 'female', meaning: 'Ewe, female sheep', liked: { user1: null, user2: null } },
  { id: '17', name: 'Sara', gender: 'female', meaning: 'Princess', liked: { user1: null, user2: null } },
  { id: '18', name: 'Tinna', gender: 'female', meaning: 'Flint', liked: { user1: null, user2: null } },
  { id: '19', name: 'Unnur', gender: 'female', meaning: 'Wave', liked: { user1: null, user2: null } },
  { id: '20', name: 'Vigdís', gender: 'female', meaning: 'War goddess', liked: { user1: null, user2: null } },
  // You can add more names or replace with a full list from an official source
];

// Sample list of Icelandic male names for future use
export const icelandicMaleNames: NameData[] = [
  { id: 'm1', name: 'Arnar', gender: 'male', meaning: 'Eagle', liked: { user1: null, user2: null } },
  { id: 'm2', name: 'Bjarni', gender: 'male', meaning: 'Bear', liked: { user1: null, user2: null } },
  { id: 'm3', name: 'Dagur', gender: 'male', meaning: 'Day', liked: { user1: null, user2: null } },
  { id: 'm4', name: 'Einar', gender: 'male', meaning: 'One warrior', liked: { user1: null, user2: null } },
  { id: 'm5', name: 'Gunnar', gender: 'male', meaning: 'Warrior', liked: { user1: null, user2: null } },
  // Add more male names as needed
];

// Combined list of all names
export const allIcelandicNames: NameData[] = [
  ...icelandicFemaleNames,
  ...icelandicMaleNames,
];