package hw1;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Queue;
import java.util.Set;

import org.jsoup.Jsoup;
import org.jsoup.nodes.*;
import org.jsoup.select.*;

public class SpiderWeb {

	    public static void main(String[] args) throws Exception {
	        String url = "http://www.uwlax.edu";     
	       search (url,10,500);
	    }

	        public static void search(String url,int N, int timeout) {
	           

	            if (!isValidUrl(url) || N < 1 || N > 10000 || timeout < 1 || timeout > 10000) {
	                System.out.println("Invalid input parameters. Please check the input and try again.");
	                return;
	            }

	            try {
	                Set<String> visitedUrls = new HashSet<>();
	                Queue<String> queue = new LinkedList<>();

	                queue.add(url);
	                visitedUrls.add(url);

	                while (!queue.isEmpty()){
	                    String currentUrl = queue.poll();
	                    printUrl(currentUrl);

	                    Document doc = Jsoup.connect(url).timeout(500 ).followRedirects( true ).get();
	                    Elements anchors = doc.select( "a" );
	                   //System.out.println(links);

	                    for (Element link : anchors) {
	                        String nextUrl = link.absUrl("href");
	                      
	                        if (!visitedUrls.contains(nextUrl) && isValidUrl(nextUrl)&& visitedUrls.size()< N) {
	                            queue.add(nextUrl);
	                            visitedUrls.add(nextUrl);
	                           // System.out.println(nextUrl);
	                        }
	                    }
	                }
	            } catch (IOException e) {
	                System.out.println("Error: " + e.getMessage());
	            }
	        }

	        private static void printUrl(String url) {
	            System.out.println(url);

	        }

	        private static boolean isValidUrl(String url) {
	            try {
	                // Use the URL class to parse the input URL
	                URL parsedUrl = new URL(url);
	                

	                // Ensure the protocol is either HTTP or HTTPS
	                String protocol = parsedUrl.getProtocol();
	              return "http".equalsIgnoreCase(protocol) || "https".equalsIgnoreCase(protocol);


	            } catch (MalformedURLException e) {
	                // Malformed URL, not valid
	                return false;
	            }
	        }
	    

	
}
