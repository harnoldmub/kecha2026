import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-background border-primary/5 shadow-luxury rounded-none">
        <CardContent className="pt-12 pb-8 px-8 flex flex-col items-center text-center gap-8">
          <div className="flex flex-col items-center gap-4">
             <AlertCircle className="h-12 w-12 text-primary/50" strokeWidth={1} />
             <h1 className="text-4xl font-serif italic text-foreground tracking-tight">Page Introuvable</h1>
          </div>
          
          <p className="font-sans text-xs tracking-widest uppercase opacity-60 leading-relaxed">
            Désolé, la page que vous recherchez semble s'être égarée dans notre vision du pur amour.
          </p>

          <Link href="/">
            <Button className="rounded-none px-12 py-7 bg-primary hover:bg-primary/90 text-white uppercase tracking-[0.3em] text-xs">
              Retour à l'accueil
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
