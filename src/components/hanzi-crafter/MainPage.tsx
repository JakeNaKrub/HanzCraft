"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { Radical, CharacterComposition, Challenge } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { getCharacterSuggestionsAction } from '@/app/actions';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Blocks, BookOpenCheck, Hammer, Sparkles, Star, Sword, Trash2, X, HelpCircle, Moon, Sun } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

const GRID_SIZE = 4;
const initialSavedCharacters: CharacterComposition[] = [];
type Theme = 'light' | 'dark';

interface MainPageProps {
  radicalsData: Radical[];
  charactersData: CharacterComposition[];
  challengesData: Challenge[];
}

export function MainPage({ radicalsData, charactersData, challengesData }: MainPageProps) {
  const [gridSlots, setGridSlots] = useState<(Radical | null)[]>(Array(GRID_SIZE).fill(null));
  const [craftedCharacter, setCraftedCharacter] = useState<CharacterComposition | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [savedCharacters, setSavedCharacters] = useLocalStorage<CharacterComposition[]>("hanzi-collection", initialSavedCharacters);
  const [activeTab, setActiveTab] = useState('radicals');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'dark');

  const { toast } = useToast();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(current => (current === 'dark' ? 'light' : 'dark'));
  };

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, radical: Radical) => {
    e.dataTransfer.setData("application/json", JSON.stringify(radical));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    const radicalJSON = e.dataTransfer.getData("application/json");
    if (radicalJSON) {
      const radical = JSON.parse(radicalJSON) as Radical;
      const newGridSlots = [...gridSlots];
      newGridSlots[index] = radical;
      setGridSlots(newGridSlots);
      setCraftedCharacter(null);
      setIsSuccess(false);
    }
  };

  const handleClearSlot = (index: number) => {
    const newGridSlots = [...gridSlots];
    newGridSlots[index] = null;
    setGridSlots(newGridSlots);
  };
  
  const handleClearGrid = () => {
    setGridSlots(Array(GRID_SIZE).fill(null));
    setCraftedCharacter(null);
    setIsSuccess(false);
    setSuggestions([]);
  }

  const handleCraft = () => {
    const componentsInGrid = gridSlots.map(r => r?.symbol || null);
    if (componentsInGrid.every(c => c === null)) {
      setCraftedCharacter(null);
      setIsSuccess(false);
      toast({
        title: "Empty Grid",
        description: "Add some radicals to the crafting grid first.",
        variant: "destructive",
      });
      return;
    }
  
    const areArraysEqual = (a: (string | null)[], b: (string | null)[]) => {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    };
  
    const foundCharacter = charactersData.find(char => {
      return areArraysEqual(char.components, componentsInGrid);
    });
  
    if (foundCharacter) {
      setCraftedCharacter(foundCharacter);
      setIsSuccess(true);
    } else {
      setCraftedCharacter(null);
      setIsSuccess(false);
      toast({
        title: "Crafting Failed",
        description: "These radicals don't form a known character in this arrangement. Try a different combination!",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    if (isSuccess && craftedCharacter && currentChallenge && craftedCharacter.character === currentChallenge.targetCharacter) {
      toast({
        title: "Challenge Complete!",
        description: `You successfully crafted '${currentChallenge.targetCharacter}' (${currentChallenge.pinyin}).`,
      });
    }
  }, [isSuccess, craftedCharacter, currentChallenge, toast]);

  const handleGetSuggestions = async () => {
    const radicalsInGrid = gridSlots.map(r => r?.symbol).filter(Boolean) as string[];
    if (radicalsInGrid.length === 0) return;
    setIsLoadingSuggestions(true);
    setSuggestions([]);
    try {
      const result = await getCharacterSuggestionsAction(radicalsInGrid);
      setSuggestions(result.suggestedCharacters);
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not fetch AI suggestions.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSaveCharacter = () => {
    if (craftedCharacter && !savedCharacters.some(c => c.character === craftedCharacter.character)) {
      setSavedCharacters([...savedCharacters, craftedCharacter]);
      toast({
        title: "Character Saved!",
        description: `'${craftedCharacter.character}' has been added to your collection.`,
      });
    }
  };

  const handleSelectChallenge = (challenge: Challenge) => {
    handleClearGrid();
    setCurrentChallenge(challenge);
    setActiveTab('radicals');
  };

  const radicalSource = useMemo(() => {
    if (currentChallenge) {
      const allowedSymbols = new Set(currentChallenge.allowedRadicals);
      return radicalsData.filter(r => allowedSymbols.has(r.symbol));
    }
    return radicalsData;
  }, [currentChallenge, radicalsData]);
  
  const canCraft = useMemo(() => gridSlots.some(slot => slot !== null), [gridSlots]);

  return (
    <TooltipProvider>
      <main className="container mx-auto p-4 md:p-8 font-body">
        <header className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                <BookOpenCheck className="w-10 h-10 text-primary" />
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold font-headline">HanzCraft By Ake</h1>
                    <p className="text-muted-foreground">Craft Chinese characters from ancient radicals.</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <HelpCircle className="w-4 h-4 mr-2" />
                            How to Play
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>How to Play HanzCraft</DialogTitle>
                            <DialogDescription>
                                Welcome! Your goal is to discover Chinese characters by combining their building blocks, called radicals.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="prose prose-sm text-foreground space-y-4">
                            <h3 className="font-bold">1. Find Your Radicals</h3>
                            <p>In the "Radicals" tab on the right, you'll find a catalogue of available character components. Drag any radical you want to use onto one of the four slots in the Crafting Table.</p>

                            <h3 className="font-bold">2. Arrange and Craft</h3>
                            <p>Arrange the radicals in the grid to match the structure of a real Chinese character (e.g., left-right, top-bottom). Once you're ready, press the "Craft" button.</p>

                            <h3 className="font-bold">3. Discover and Collect</h3>
                            <p>If your combination is correct, a new character will appear! You can see its meaning and pronunciation. Don't forget to click the <Star className="inline w-4 h-4" /> button to save it to your Collection.</p>

                            <h3 className="font-bold">4. Need a Hint?</h3>
                            <p>Place some radicals in the grid and use the "AI Suggestions" to get ideas for characters you might be able to build.</p>

                            <h3 className="font-bold">5. Test Your Skills</h3>
                            <p>Visit the "Challenges" tab to try crafting specific characters with a limited set of radicals. It's a great way to learn!</p>
                        </div>
                    </DialogContent>
                </Dialog>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={toggleTheme}>
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Toggle Theme</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Crafting Area */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Blocks className="text-primary"/>Crafting Table</CardTitle>
                <CardDescription>Drag radicals into the grid, then press Craft to form a character.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    {/* Grid */}
                    <div className="relative pb-16">
                      <div className="grid grid-cols-2 gap-2 bg-muted/50 p-4 rounded-lg border">
                        {gridSlots.map((radical, index) => (
                          <div key={index} onDrop={(e) => handleDrop(e, index)} onDragOver={handleDragOver}
                              className="relative w-24 h-24 bg-background rounded-md flex items-center justify-center border-2 border-dashed hover:border-primary transition-colors">
                              {radical ? (
                                <div className="animate-subtle-appear cursor-grab text-5xl">
                                  {radical.symbol}
                                  <button onClick={() => handleClearSlot(index)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-80 hover:opacity-100">
                                      <X className="w-4 h-4"/>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">Empty</span>
                              )}
                          </div>
                        ))}
                      </div>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="absolute bottom-4 left-1/3 -translate-x-1/2" onClick={handleClearGrid}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Clear Grid</p>
                          </TooltipContent>
                      </Tooltip>
                      <Button variant="default" size="lg" className="absolute bottom-2 right-1/2 translate-x-[calc(50%_+_3rem)]" onClick={handleCraft} disabled={!canCraft}>
                        <Hammer className="w-5 h-5" />
                        Craft
                      </Button>
                    </div>

                    <div className="text-4xl text-muted-foreground font-bold">{`->`}</div>

                    {/* Output */}
                    <div className="relative w-36 h-36">
                      <div className={`w-full h-full bg-muted/50 rounded-lg flex items-center justify-center border-2 ${isSuccess ? 'border-accent' : 'border-dashed'} ${isSuccess ? 'animate-pulse-gold' : ''}`}>
                          {craftedCharacter ? (
                            <div className="text-7xl animate-subtle-appear">{craftedCharacter.character}</div>
                          ) : (
                            <div className="text-7xl text-muted-foreground/50">?</div>
                          )}
                      </div>
                      {isSuccess && craftedCharacter && (
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <Button variant="default" size="icon" className="absolute -bottom-4 left-1/2 -translate-x-1/2" onClick={handleSaveCharacter}>
                                      <Star className="w-4 h-4" />
                                  </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Save to Collection</p>
                              </TooltipContent>
                          </Tooltip>
                      )}
                    </div>
                </div>
              </CardContent>
            </Card>

            {craftedCharacter && (
              <Card className="animate-subtle-appear shadow-lg">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">{craftedCharacter.character} ({craftedCharacter.pinyin})</CardTitle>
                  <CardDescription className="capitalize">{craftedCharacter.meaning}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Example: {craftedCharacter.usage}</p>
                </CardContent>
              </Card>
            )}

            {/* AI Suggestions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" />AI Suggestions</CardTitle>
                <CardDescription>Not sure what to build? Get some ideas from our AI assistant.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleGetSuggestions} disabled={isLoadingSuggestions || gridSlots.every(s => s === null)}>
                  {isLoadingSuggestions ? 'Thinking...' : 'Suggest Characters'}
                </Button>
                {isLoadingSuggestions && (
                  <div className="mt-4 flex gap-2">
                    <Skeleton className="w-16 h-16" />
                    <Skeleton className="w-16 h-16" />
                    <Skeleton className="w-16 h-16" />
                  </div>
                )}
                {suggestions.length > 0 && (
                  <div className="mt-4">
                    <p className="font-bold mb-2">Suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((char, i) => (
                        <div key={i} className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-3xl font-bold">
                          {char}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="radicals">Radicals</TabsTrigger>
                <TabsTrigger value="collection">Collection</TabsTrigger>
                <TabsTrigger value="challenges">Challenges</TabsTrigger>
              </TabsList>
              <TabsContent value="radicals">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Radical Catalogue</CardTitle>
                    {currentChallenge ? (
                      <CardDescription className="text-accent-foreground font-semibold bg-accent/20 border border-accent p-2 rounded-lg">
                        Challenge Mode: Craft '{currentChallenge.targetCharacter}'
                        <Button variant="ghost" size="sm" onClick={() => setCurrentChallenge(null)} className="ml-2">Exit</Button>
                      </CardDescription>
                    ) : <CardDescription>Drag a radical to the crafting table.</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="grid grid-cols-4 gap-2">
                        {radicalSource.map(radical => (
                            <Tooltip key={radical.id}>
                                <TooltipTrigger asChild>
                                    <button draggable onDragStart={(e) => handleDragStart(e, radical)}
                                        className="w-full h-16 bg-background border rounded-lg flex flex-col items-center justify-center text-3xl cursor-grab active:cursor-grabbing hover:bg-muted transition-colors">
                                        {radical.symbol}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="capitalize">{radical.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="collection">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>My Collection</CardTitle>
                    <CardDescription>Characters you have successfully crafted and saved.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      {savedCharacters.length > 0 ? (
                        <div className="space-y-2">
                          {savedCharacters.map(char => (
                            <div key={char.character} className="flex items-center justify-between p-2 bg-muted rounded-md">
                              <div className="flex items-center gap-4">
                                <span className="text-3xl">{char.character}</span>
                                <div>
                                  <p className="font-bold">{char.pinyin}</p>
                                  <p className="text-sm text-muted-foreground capitalize">{char.meaning}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-muted-foreground text-center py-8">Your collection is empty.</p>}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="challenges">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sword className="text-primary"/>Challenges</CardTitle>
                    <CardDescription>Test your skills by crafting specific characters.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {challengesData.map(challenge => (
                          <div key={challenge.id} className="p-4 border rounded-lg bg-muted/50">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-lg">Craft: <span className="text-2xl">{challenge.targetCharacter}</span></p>
                                <p className="text-sm text-muted-foreground">{challenge.pinyin} - {challenge.meaning}</p>
                              </div>
                              <Button size="sm" onClick={() => handleSelectChallenge(challenge)}>Start</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </TooltipProvider>
  );
}
