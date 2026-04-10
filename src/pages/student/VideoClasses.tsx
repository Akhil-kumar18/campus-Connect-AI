import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Play, Search, Clock, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { VideoClass } from '@/types';

export default function VideoClasses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoClass | null>(null);

  const [videos, setVideos] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [translateLang, setTranslateLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  // Mock Translation Helper
  const getTranslatedText = (text: string, lang: string, type: 'short' | 'medium' | 'long') => {
    if (lang === 'en') return text;

    // Mock translations for demo purposes since we don't have a real API key
    const translations: Record<string, Record<string, string>> = {
      kan: {
        short: "ವೀಡಿಯೊದ ತ್ವರಿತ ಅವಲೋಕನ: ಈ ವೀಡಿಯೊ ಮೂಲಭೂತ ಪರಿಕಲ್ಪನೆಗಳನ್ನು ಮತ್ತು ಪ್ರಮುಖ ಅಂಶಗಳನ್ನು ಪರಿಣಾಮಕಾರಿಯಾಗಿ ಒಳಗೊಂಡಿದೆ.",
        medium: "ಈ ಅಧಿವೇಶನವು ವಿಷಯವನ್ನು ಆಳವಾಗಿ ಪರಿಶೋಧಿಸುತ್ತದೆ. ಪ್ರಮುಖ ವಿಷಯಗಳಲ್ಲಿ ಮೂಲ ತತ್ವಗಳು, ಪ್ರಾಯೋಗಿಕ ಅನ್ವಯಗಳು ಮತ್ತು ಸಾಮಾನ್ಯ ತಪ್ಪುಗಳು ಸೇರಿವೆ. ವಿಮರ್ಶೆ ಮತ್ತು ಪರೀಕ್ಷೆಯ ತಯಾರಿಗಾಗಿ ಸೂಕ್ತವಾಗಿದೆ.",
        long: "ಈ ಸಮಗ್ರ ವೀಡಿಯೊ ಉಪನ್ಯಾಸದಲ್ಲಿ, ಬೋಧಕರು ವಿಷಯದ ಸಂಪೂರ್ಣ ಪರಿಶೋಧನೆಯನ್ನು ಒದಗಿಸುತ್ತಾರೆ, ಬಲವಾದ ಅಡಿಪಾಯವನ್ನು ಸ್ಥಾಪಿಸಲು ಮೂಲಭೂತ ತತ್ವಗಳು ಮತ್ತು ಐತಿಹಾಸಿಕ ಸಂದರ್ಭದೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸುತ್ತಾರೆ. ಅಧಿವೇಶನವು ಪ್ರಾಯೋಗಿಕ ರೀತಿಯಲ್ಲಿ ಸಂಕೀರ್ಣ ಸಿದ್ಧಾಂತಗಳನ್ನು ವಿವರಿಸಲು ನೈಜ-ಪ್ರಪಂಚದ ಉದಾಹರಣೆಗಳನ್ನು ಬಳಸಿಕೊಂಡು ಸುಧಾರಿತ ಪರಿಕಲ್ಪನೆಗಳ ಮೂಲಕ ವ್ಯವಸ್ಥಿತವಾಗಿ ಮುಂದುವರಿಯುತ್ತದೆ. ಪ್ರಮುಖ ವಿಧಾನಗಳ ವಿವರವಾದ ವಿವರಣೆಯು ವಿಭಿನ್ನ ತಂತ್ರಗಳು ಮತ್ತು ತಪ್ಪಿಸಬೇಕಾದ ಸಾಮಾನ್ಯ ತಪ್ಪುಗಳನ್ನು ಎತ್ತಿ ತೋರಿಸುವ ಕೇಸ್ ಸ್ಟಡೀಸ್‌ನೊಂದಿಗೆ ವಿಂಗಡಿಸಲಾಗಿದೆ. ಉಪನ್ಯಾಸವು ಈ ಆಲೋಚನೆಗಳ ಸಂಶ್ಲೇಷಣೆಯೊಂದಿಗೆ ಮುಕ್ತಾಯಗೊಳ್ಳುತ್ತದೆ, ವಿಷಯದ ಸಮಗ್ರ ನೋಟವನ್ನು ಮತ್ತು ಭವಿಷ್ಯದ ಅನ್ವಯಿಕೆಗಾಗಿ ಕ್ರಿಯಾಶೀಲ ಒಳನೋಟಗಳನ್ನು ನೀಡುತ್ತದೆ."
      },
      tel: {
        short: "వీడియో యొక్క శీఘ్ర అవలోకనం: ఈ వీడియో ప్రాథమిక అంశాలు మరియు ముఖ్య విషయాలను సమర్థవంతంగా కవర్ చేస్తుంది.",
        medium: "ఈ సెషన్ విషయాన్ని లోతుగా విశ్లేషిస్తుంది. ముఖ్య విషయాలలో ప్రధాన సూత్రాలు, ఆచరణాత్మక అనువర్తనాలు మరియు సాధారణ తప్పులు ఉన్నాయి. సమీక్ష మరియు పరీక్ష తయారీకి అనుకూలం.",
        long: "ఈ సమగ్ర వీడియో ఉపన్యాసంలో, బోధకుడు విషయం యొక్క సమగ్ర అన్వేషణను అందిస్తారు, బలమైన పునాదిని స్థాపించడానికి ప్రాథమిక సూత్రాలు మరియు చారిత్రక సందర్భంతో ప్రారంభమవుతుంది. సెషన్ క్రమపద్ధతిలో అధునాతన భావనల ద్వారా పురోగమిస్తుంది, ఆచరణాత్మక పద్ధతిలో సంక్లిష్ట సిద్ధాంతాలను వివరించడానికి వాస్తవ ప్రపంచ ఉదాహరణలను ఉపయోగిస్తుంది. కీలక పద్దతుల యొక్క వివరణాత్మక వివరణలు కేస్ స్టడీస్‌తో విడదీయబడ్డాయి, ఇవి విభిన్నమైన వ్యూహాలను మరియు నివారించాల్సిన సాధారణ ఆపదలను హైలైట్ చేస్తాయి. ఉపన్యాసం ఈ ఆలోచనల సంశ్లేషణతో ముగుస్తుంది, అంశం యొక్క సమగ్ర వీక్షణను మరియు భవిష్యత్ అనువర్తనం కోసం చర్య తీసుకోదగిన అంతర్దృష్టులను అందిస్తుంది."
      },
      hin: {
        short: "वीडियो का त्वरित अवलोकन: यह वीडियो मौलिक अवधारणाओं और मुख्य बिंदुओं को प्रभावी ढंग से कवर करता है।",
        medium: "यह सत्र विषय को गहराई से खोजता है। प्रमुख विषयों में मूल सिद्धांत, व्यावहारिक अनुप्रयोग और सामान्य गलतियाँ शामिल हैं। समीक्षा और परीक्षा की तैयारी के लिए उपयुक्त।",
        long: "इस व्यापक वीडियो व्याख्यान में, प्रशिक्षक विषय वस्तु का गहन अन्वेषण प्रदान करता है, एक मजबूत आधार स्थापित करने के लिए मौलिक सिद्धांतों और ऐतिहासिक संदर्भ के साथ शुरुआत करता है। सत्र व्यवस्थित रूप से उन्नत अवधारणाओं के माध्यम से आगे बढ़ता है, व्यावहारिक तरीके से जटिल सिद्धांतों को चित्रित करने के लिए वास्तविक दुनिया के उदाहरणों का उपयोग करता है। प्रमुख कार्यप्रणालियों की विस्तृत व्याख्या मामले के अध्ययन के साथ interspersed हैं जो अलग-अलग रणनीतियों और सामान्य कमियों से बचने के लिए उजागर करते हैं। व्याख्यान इन विचारों के संश्लेषण के साथ समाप्त होता है, जो भविष्य के आवेदन के लिए विषय और कार्रवाई योग्य अंतर्दृष्टि का समग्र दृष्टिकोण प्रदान करता है।"
      },
      tam: {
        short: "வீடியோவின் விரைவான கண்ணோட்டம்: இந்த வீடியோ அடிப்படை கருத்துக்கள் மற்றும் முக்கிய குறிப்புகளை திறம்பட உள்ளடக்கியது.",
        medium: "இந்த அமர்வு தலைப்பை ஆழமாக ஆராய்கிறது. முக்கிய தலைப்புகளில் முக்கிய கொள்கைகள், நடைமுறை பயன்பாடுகள் மற்றும் பொதுவான பிழைகள் அடங்கும். மதிப்பாய்வு மற்றும் தேர்வு தயாரிப்புக்கு ஏற்றது.",
        long: "இந்த விரிவான வீடியோ விரிவுரையில், பயிற்றுவிப்பாளர் ஒரு வலுவான அடித்தளத்தை நிறுவுவதற்கான அடிப்படைக் கொள்கைகள் மற்றும் வரலாற்று சூழலுடன் தொடங்கி, பொருளின் முழுமையான ஆய்வை வழங்குகிறது. அமர்வு முறையாக மேம்பட்ட கருத்துக்கள் மூலம் முன்னேறுகிறது, சிக்கலான கோட்பாடுகளை நடைமுறை முறையில் விளக்குவதற்கு நிஜ உலக எடுத்துக்காட்டுகளைப் பயன்படுத்துகிறது. முக்கிய முறைகளின் விரிவான விளக்கங்கள் தனித்துவமான உத்திகள் மற்றும் தவிர்க்க வேண்டிய பொதுவான ஆபத்துக்களை முன்னிலைப்படுத்தும் வழக்கு ஆய்வுகளுடன் இணைக்கப்பட்டுள்ளன. விரிவுரை இந்த யோசனைகளின் தொகுப்புடன் முடிவடைகிறது, தலைப்பின் முழுமையான பார்வை மற்றும் எதிர்கால பயன்பாட்டிற்கான செயல்படக்கூடிய நுண்ணறிவுகளை வழங்குகிறது."
      }
    };

    // Return specific translation if mock matches, otherwise standard fallback
    const langData = translations[lang];
    if (langData && langData[type]) {
      // If the text matches our default generated text pattern or is non-empty, use the mock.
      // For robustness in this demo, strictly return the mock for the demo effect.
      return langData[type];
    }

    return `[${lang.toUpperCase()} Translation]: ${text}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('campusconnect_token');
        const headers = { Authorization: `Bearer ${token}` };

        const [videosRes, coursesRes] = await Promise.all([
          fetch('/api/videos', { headers }),
          fetch('/api/courses', { headers }),
          // We might need to fetch all modules or filter by course. For now, let's fetch basic modules if possible, 
          // or just rely on IDs if we can't fetch all. 
          // A better approach might be to fetch modules when a course is selected or just accept we might not have names.
          // Let's assume we can fetch all or just handle missing names gracefully.
          // Actually, let's just fetch courses for the filter and videos for the list.
          // Videos usually contain courseId and moduleId. 
        ]);

        if (videosRes.ok) setVideos(await videosRes.json());
        if (coursesRes.ok) setCourses(await coursesRes.json());

      } catch (error) {
        console.error("Error fetching video classes data:", error);
      }
    };
    fetchData();
  }, []);

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || video.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <DashboardLayout requiredRole="student">
      <PageHeader
        title="Video Classes"
        description="Watch recorded lectures with AI-generated summaries"
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Videos Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((video, index) => (
          <Card
            key={video.id}
            className="overflow-hidden animate-slide-up cursor-pointer hover:shadow-lg transition-all"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => setSelectedVideo(video)}
          >
            <div className="relative aspect-video bg-gradient-to-br from-primary/30 to-primary/5">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-primary/90 p-4 shadow-lg transition-transform hover:scale-110">
                  <Play className="h-8 w-8 text-primary-foreground" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 rounded bg-foreground/80 px-2 py-1 text-xs text-background">
                {video.duration || "0:00"}
              </div>
              {video.summaryShort && (
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                  <Sparkles className="h-3 w-3" />
                  AI Summary
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="mb-1 font-semibold line-clamp-1">{video.title}</h3>
              <p className="text-sm text-muted-foreground">{video.faculty?.name || 'Unknown Faculty'}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{/* Module Name could go here if available */}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(video.createdAt), 'MMM d')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6 h-[calc(90vh-80px)]">
            {/* Left Side - Video */}
            <div className="flex flex-col gap-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                {(() => {
                  if (!selectedVideo?.videoUrl) {
                    return (
                      <div className="text-center text-white">
                        <p>Video not available</p>
                      </div>
                    );
                  }

                  const getYouTubeId = (url: string) => {
                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&?]*).*/;
                    const match = url.match(regExp);
                    return (match && match[2].length === 11) ? match[2] : null;
                  };

                  const youtubeId = getYouTubeId(selectedVideo.videoUrl);

                  if (youtubeId) {
                    return (
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    );
                  }

                  return (
                    <video
                      controls
                      crossOrigin="anonymous"
                      className="w-full h-full"
                      src={selectedVideo.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  );
                })()}
              </div>
            </div>

            {/* Right Side - AI Summaries */}
            <div className="flex flex-col h-full overflow-hidden">
              {(selectedVideo?.summaryShort || selectedVideo?.summaryMedium || selectedVideo?.summaryLong) ? (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">AI-Generated Summaries</h4>
                    </div>

                    {/* Translation Controls */}
                    <Select
                      value={translateLang}
                      onValueChange={(v) => {
                        setIsTranslating(true);
                        setTimeout(() => {
                          setTranslateLang(v);
                          setIsTranslating(false);
                        }, 500);
                      }}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <div className="flex items-center gap-2">
                          <span role="img" aria-label="translate">🌐</span>
                          <SelectValue placeholder="Translate" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (Original)</SelectItem>
                        <SelectItem value="kan">Kannada (ಕನ್ನಡ)</SelectItem>
                        <SelectItem value="tel">Telugu (తెలుగు)</SelectItem>
                        <SelectItem value="hin">Hindi (हिंदी)</SelectItem>
                        <SelectItem value="tam">Tamil (தமிழ்)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Tabs defaultValue="long" className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="long">Full Summary</TabsTrigger>
                      <TabsTrigger value="medium">Key Points</TabsTrigger>
                      <TabsTrigger value="short">Quick Overview</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 mt-4 overflow-hidden">
                      {isTranslating ? (
                        <div className="h-full flex items-center justify-center bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                            <Sparkles className="h-4 w-4" />
                            Translating content...
                          </div>
                        </div>
                      ) : (
                        <>
                          <TabsContent value="short" className="h-full rounded-lg bg-muted p-4 overflow-y-auto scrollbar-thin m-0">
                            <p className="text-sm leading-relaxed">
                              {getTranslatedText(selectedVideo?.summaryShort || "No short summary available.", translateLang, 'short')}
                            </p>
                          </TabsContent>
                          <TabsContent value="medium" className="h-full rounded-lg bg-muted p-4 overflow-y-auto scrollbar-thin m-0">
                            <p className="text-sm leading-relaxed">
                              {getTranslatedText(selectedVideo?.summaryMedium || "No standard summary available.", translateLang, 'medium')}
                            </p>
                          </TabsContent>
                          <TabsContent value="long" className="h-full rounded-lg bg-muted p-4 overflow-y-auto scrollbar-thin m-0">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {getTranslatedText(selectedVideo?.summaryLong || "No detailed summary available.", translateLang, 'long')}
                            </p>
                          </TabsContent>
                        </>
                      )}
                    </div>
                  </Tabs>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>No AI summaries available for this video</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {filteredVideos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Video className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No videos found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
