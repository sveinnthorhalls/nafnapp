export interface NameData {
  id: string;
  name: string;
  liked?: {
    user1: boolean | null;
    user2: boolean | null;
  };
}

// Sample list of Icelandic female names
// This is just a starter list - you may want to replace with a more complete list
export const icelandicFemaleNames: NameData[] = [
  { id: '1', name: 'Ásta', liked: { user1: null, user2: null } },
  { id: '2', name: 'Birna', liked: { user1: null, user2: null } },
  { id: '3', name: 'Dagný', liked: { user1: null, user2: null } },
  { id: '4', name: 'Embla', liked: { user1: null, user2: null } },
  { id: '5', name: 'Freyja', liked: { user1: null, user2: null } },
  { id: '6', name: 'Guðrún', liked: { user1: null, user2: null } },
  { id: '7', name: 'Hekla', liked: { user1: null, user2: null } },
  { id: '8', name: 'Íris', liked: { user1: null, user2: null } },
  { id: '9', name: 'Jóhanna', liked: { user1: null, user2: null } },
  { id: '10', name: 'Katrín', liked: { user1: null, user2: null } },
  { id: '11', name: 'Lilja', liked: { user1: null, user2: null } },
  { id: '12', name: 'Margrét', liked: { user1: null, user2: null } },
  { id: '13', name: 'Nanna', liked: { user1: null, user2: null } },
  { id: '14', name: 'Ólöf', liked: { user1: null, user2: null } },
  { id: '15', name: 'Petra', liked: { user1: null, user2: null } },
  { id: '16', name: 'Rakel', liked: { user1: null, user2: null } },
  { id: '17', name: 'Sara', liked: { user1: null, user2: null } },
  { id: '18', name: 'Tinna', liked: { user1: null, user2: null } },
  { id: '19', name: 'Unnur', liked: { user1: null, user2: null } },
  { id: '20', name: 'Vigdís', liked: { user1: null, user2: null } },
  // You can add more names or replace with a full list from an official source
];