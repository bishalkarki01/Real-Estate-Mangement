import org.jsoup.Jsoup;
import org.jsoup.nodes.*;
import org.jsoup.select.*;

public class App {
    public static void main(String[] args) throws Exception {
        String url = "http://www.google.com";
        Document doc = Jsoup.connect(url).timeout( 1500 ).followRedirects( true ).get();
        Elements anchors = doc.select( "a" );
       for(Element e : anchors ) {
            System.out.println(e);
       }
    }
}
