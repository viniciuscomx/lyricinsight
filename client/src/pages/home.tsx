import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Reference {
  title: string;
  description: string;
  icon: string;
}

interface Curiosity {
  title: string;
  description: string;
  icon: string;
}

interface AnalysisResult {
  songTitle?: string;
  artist?: string;
  references: Reference[];
  curiosities: Curiosity[];
  authorIntention: string;
}

export default function Home() {
  const [lyrics, setLyrics] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (lyrics: string) => {
      const response = await apiRequest("POST", "/api/analyze", { lyrics });
      return response.json() as Promise<AnalysisResult>;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast({
        title: "Análise concluída!",
        description: "A letra foi analisada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível analisar a letra. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lyrics.length < 50) {
      toast({
        title: "Letra muito curta",
        description: "A letra deve ter pelo menos 50 caracteres para análise.",
        variant: "destructive",
      });
      return;
    }
    analyzeMutation.mutate(lyrics);
  };

  const handleClear = () => {
    setLyrics("");
    setAnalysis(null);
  };

  const handleNewAnalysis = () => {
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-light font-inter">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary py-6 px-4 shadow-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="fas fa-music text-3xl text-white"></i>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">LyricAI</h1>
                <p className="text-blue-100 text-sm">Análise Inteligente de Letras Musicais</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <i className="fas fa-brain text-white text-xl"></i>
              <span className="text-white text-sm">Powered by AI</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Input Section */}
        <section className="mb-12">
          <div className="bg-bg-slate rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-semibold mb-2 text-text-light">
                <i className="fas fa-microphone-alt text-primary mr-3"></i>
                Cole a Letra da Música
              </h2>
              <p className="text-text-muted">Nossa IA irá analisar a letra e revelar referências, curiosidades e a verdadeira intenção do artista.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <Textarea 
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Cole aqui a letra completa da música que você gostaria de analisar..."
                  className="w-full h-64 bg-bg-dark border border-gray-600 rounded-xl p-4 text-text-light placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-text-muted">
                    <i className="fas fa-info-circle mr-1"></i>
                    Mínimo de 50 caracteres para análise
                  </span>
                  <span className="text-sm text-text-muted">{lyrics.length} caracteres</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="submit"
                  disabled={lyrics.length < 50 || analyzeMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Analisando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2"></i>
                      Analisar Letra
                    </>
                  )}
                </Button>
                <Button 
                  type="button"
                  onClick={handleClear}
                  variant="secondary"
                  className="bg-bg-card hover:bg-gray-600 text-text-muted hover:text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200"
                >
                  <i className="fas fa-trash-alt mr-2"></i>
                  Limpar
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* Loading State */}
        {analyzeMutation.isPending && (
          <section className="mb-12">
            <div className="bg-bg-slate rounded-2xl p-8 shadow-2xl border border-gray-700">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-gray-600 border-t-primary rounded-full animate-spin"></div>
                  <i className="fas fa-brain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analisando a Letra...</h3>
                <p className="text-text-muted text-center max-w-md">
                  Nossa IA está processando a música e identificando referências, curiosidades e significados ocultos.
                </p>
                <div className="mt-6 flex space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Analysis Results */}
        {analysis && (
          <section>
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                <i className="fas fa-chart-line text-success mr-3"></i>
                Análise Completa
              </h2>
              <p className="text-text-muted">Descubra os segredos por trás da música</p>
            </div>

            {/* Song Info Card */}
            {(analysis.songTitle || analysis.artist) && (
              <div className="bg-gradient-to-r from-bg-slate to-bg-card rounded-2xl p-6 mb-8 shadow-2xl border border-gray-700">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-music text-white text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    {analysis.songTitle && (
                      <h3 className="text-xl font-semibold mb-1">{analysis.songTitle}</h3>
                    )}
                    {analysis.artist && (
                      <p className="text-text-muted mb-2">{analysis.artist}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* References */}
              <Card className="bg-bg-slate rounded-2xl shadow-2xl border border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4">
                      <i className="fas fa-link text-primary text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-light">Referências</h3>
                      <p className="text-text-muted text-sm">Influências e citações identificadas</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {analysis.references.map((ref, index) => (
                      <div key={index} className="bg-bg-dark rounded-xl p-4 border border-gray-600">
                        <div className="flex items-start space-x-3">
                          <i className={`${ref.icon} text-primary mt-1`}></i>
                          <div>
                            <h4 className="font-medium mb-1 text-text-light">{ref.title}</h4>
                            <p className="text-text-muted text-sm">{ref.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Curiosities */}
              <Card className="bg-bg-slate rounded-2xl shadow-2xl border border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-warning/20 rounded-xl flex items-center justify-center mr-4">
                      <i className="fas fa-lightbulb text-warning text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-light">Curiosidades</h3>
                      <p className="text-text-muted text-sm">Fatos interessantes sobre a música</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {analysis.curiosities.map((curiosity, index) => (
                      <div key={index} className="bg-bg-dark rounded-xl p-4 border border-gray-600">
                        <div className="flex items-start space-x-3">
                          <i className={`${curiosity.icon} text-success mt-1`}></i>
                          <div>
                            <h4 className="font-medium mb-1 text-text-light">{curiosity.title}</h4>
                            <p className="text-text-muted text-sm">{curiosity.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Author Intention */}
            <div className="bg-gradient-to-br from-bg-slate to-bg-card rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mr-5">
                  <i className="fas fa-heart text-secondary text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-text-light">Intenção do Autor</h3>
                  <p className="text-text-muted">O verdadeiro significado por trás da letra</p>
                </div>
              </div>
              
              <div className="bg-bg-dark rounded-xl p-6 border border-gray-600">
                <div className="prose prose-invert max-w-none">
                  {analysis.authorIntention.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-text-light leading-relaxed mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-600">
                  <div className="flex items-center justify-between text-sm text-text-muted">
                    <span>
                      <i className="fas fa-brain mr-2"></i>
                      Análise gerada por IA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-700">
              <Button 
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                onClick={() => {
                  navigator.share?.({
                    title: `Análise da música: ${analysis.songTitle || 'Música analisada'}`,
                    text: 'Confira esta análise incrível de letra musical!',
                    url: window.location.href
                  });
                }}
              >
                <i className="fas fa-share-alt mr-2"></i>
                Compartilhar Análise
              </Button>
              <Button 
                onClick={handleNewAnalysis}
                className="bg-secondary hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200"
              >
                <i className="fas fa-plus mr-2"></i>
                Nova Análise
              </Button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-bg-slate border-t border-gray-700 py-8 px-4 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <i className="fas fa-music text-primary text-xl"></i>
              <span className="font-semibold">LyricAI</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-text-muted">
              <a href="#" className="hover:text-white transition-colors duration-200">Sobre</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Contato</a>
            </div>
          </div>
          <div className="text-center text-sm text-text-muted mt-4 pt-4 border-t border-gray-700">
            © 2024 LyricAI. Análise inteligente de letras musicais powered by AI.
          </div>
        </div>
      </footer>
    </div>
  );
}
