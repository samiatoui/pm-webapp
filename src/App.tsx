import { useState } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';

function App() {
  interface Character {
    id: number;
    attributes: { [key: string]: number };
    skills: { [key: string]: number };
  }

  const API_URL = 'https://recruiting.verylongdomaintotestwith.ca/api/{samiatoui}/character';

  const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const initialAttributes = ATTRIBUTE_LIST.reduce((acc, attr) => {
    acc[attr] = 10;
    return acc;
  }, {} as { [key: string]: number });

  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [requiredAttributes, setRequiredAttributes] = useState<{ [key: string]: number } | null>(null);

  const handleClassClick = (className: string) => {
    setSelectedClass(className);
    setRequiredAttributes(CLASS_LIST[className]);
  };

  const closeRequiredAttributesBox = () => {
    setSelectedClass(null);
    setRequiredAttributes(null);
  };

  const loadCharacterData = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        const attributes = data.body.attributes;
        const skills = data.body.skills;

        if (attributes && typeof attributes === 'object') {
          const newCharacter: Character = { id: characters.length, attributes, skills: skills || {} };
          setCharacters(prev => [...prev, newCharacter]);
        } else {
          console.error('Invalid attributes data structure', attributes);
        }
      } else {
        console.error('Failed to fetch character data');
      }
    } catch (error) {
      console.error('Error fetching character data:', error);
    }
  };

  const saveCharacterData = async (character: Character) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(character),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Character saved successfully:', data);
      } else {
        console.error('Failed to save character data');
      }
    } catch (error) {
      console.error('Error saving character data:', error);
    }
  };

  const addCharacter = () => {
    setCharacters(prev => [
      ...prev,
      { id: prev.length, attributes: { ...initialAttributes }, skills: {} },
    ]);
  };

  const removeCharacter = (index: number) => {
    setCharacters(prev => prev.filter((_, i) => i !== index));
  };

  const updateAttribute = (characterIndex: number, key: string, change: number) => {
    setCharacters(prev => {
      const character = prev[characterIndex];
      const newAttributes = { ...character.attributes, [key]: character.attributes[key] + change };

      const totalAttributes = Object.values(newAttributes).reduce((sum, value) => sum + value, 0);
      if (totalAttributes > 70) {
        alert('Total attributes cannot exceed 70. Please decrease another attribute first.');
        return prev;
      }

      const updatedCharacter = { ...character, attributes: newAttributes };
      const updatedCharacters = [...prev];
      updatedCharacters[characterIndex] = updatedCharacter;

      return updatedCharacters;
    });
  };

  const spendSkillPoints = (characterIndex: number, skill: string, change: number) => {
    setCharacters(prev => {
      const character = prev[characterIndex];
      const currentPoints = character.skills[skill] || 0;
      const newPoints = Math.max(currentPoints + change, 0); // min 0 points

      return { ...prev, [characterIndex]: { ...character, skills: { ...character.skills, [skill]: newPoints } } };
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
        <button onClick={loadCharacterData} style={{ marginTop: '20px' }}>
          Load Character
        </button>
        <button onClick={addCharacter} style={{ marginTop: '20px' }}>
          Add Character
        </button>
      </header>
      <section className="App-section">
        <div>
          <h2>Classes</h2>
          <ul>
            {Object.keys(CLASS_LIST).map((className) => (
              <li key={className} onClick={() => handleClassClick(className)}>
                {className} 
              </li>

            ))}
          </ul>

          {selectedClass && requiredAttributes && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              backgroundColor: 'black',
              color: 'white',
            }}>
              <h2>Required Attributes for {selectedClass}</h2>
              <ul>
                {Object.entries(requiredAttributes).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value}
                  </li>
                ))}
              </ul>
              <button onClick={closeRequiredAttributesBox} style={{ marginTop: '10px', color: 'black' }}>
                Close Requirement View
              </button>
            </div>
          )}
        </div>
        {characters.map((character, index) => (
          <div key={character.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h1>Character {character.id} </h1> 
            <h1>Attributes</h1>
            <ul>
              {Object.keys(character.attributes).map((key) => (
                <li key={key}>
                  {key}: {character.attributes[key]} (Modifier: {calculateModifier(character.attributes[key])})
                  <button onClick={() => updateAttribute(index, key, 1)}>+</button>
                  <button onClick={() => updateAttribute(index, key, -1)}>-</button>
                </li>
              ))}
            </ul>
            <h1>Skills</h1>
            {SKILL_LIST.map(skill => {
              const attributeModifier = calculateModifier(character.attributes[skill.attributeModifier]);
              const pointsSpent = character.skills[skill.name] || 0;
              const totalSkillValue = pointsSpent + attributeModifier;

              return (
                <div key={skill.name}>
                  {skill.name} Points: {pointsSpent}
                  <button onClick={() => spendSkillPoints(index, skill.name, 1)}>+</button>
                  <button onClick={() => spendSkillPoints(index, skill.name, -1)}>-</button>
                  <span> (Modifier: {skill.attributeModifier})</span>
                  <span> Total: {totalSkillValue}</span>
                </div>
              );
            })}
            <button onClick={() => saveCharacterData(character)} style={{ marginTop: '20px' }}>
              Save Character
            </button>
            <button onClick={() => removeCharacter(index)}>Delete Character</button>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;
