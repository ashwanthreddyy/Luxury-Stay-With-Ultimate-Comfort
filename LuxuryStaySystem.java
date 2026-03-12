import java.util.*;

class User {
    String name;
    String email;
    String password;

    User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }
}

class Booking {
    String customerName;
    String hotel;
    String roomType;
    int price;

    Booking(String name, String hotel, String room, int price) {
        this.customerName = name;
        this.hotel = hotel;
        this.roomType = room;
        this.price = price;
    }
}

public class LuxuryStaySystem {

    static Scanner sc = new Scanner(System.in);

    static HashMap<String, User> users = new HashMap<>();
    static ArrayList<Booking> bookings = new ArrayList<>();
    static Queue<String> bookingQueue = new LinkedList<>();


    static void loadDemoUsers() {
        users.put("guest@luxurystay.in",
                new User("Anika Sharma","guest@luxurystay.in","luxury123"));

        users.put("admin@luxurystay.in",
                new User("Admin","admin@luxurystay.in","admin2025"));
    }


    static User login() {

        System.out.println("\n===== LOGIN =====");

        System.out.print("Email: ");
        String email = sc.nextLine();

        System.out.print("Password: ");
        String password = sc.nextLine();

        User u = users.get(email);

        if(u != null && u.password.equals(password)) {
            System.out.println("Login successful. Welcome " + u.name);
            return u;
        }

        System.out.println("Invalid credentials");
        return null;
    }


    static void showHotels() {

        System.out.println("\n===== HOTELS =====");

        System.out.println("1. Imperial Palace – ₹12000");
        System.out.println("2. Rambagh Palace – ₹32000");
        System.out.println("3. Grand Harbour Suites – ₹28000");
        System.out.println("4. Leela Beach Resort – ₹16500");

    }


    static void bookRoom(User user) {

        showHotels();

        System.out.print("Select hotel (1-4): ");
        int choice = sc.nextInt();
        sc.nextLine();

        String hotel="";
        int price=0;

        switch(choice) {

            case 1:
                hotel="Imperial Palace";
                price=12000;
                break;

            case 2:
                hotel="Rambagh Palace";
                price=32000;
                break;

            case 3:
                hotel="Grand Harbour Suites";
                price=28000;
                break;

            case 4:
                hotel="Leela Beach Resort";
                price=16500;
                break;

            default:
                System.out.println("Invalid choice");
                return;
        }

        System.out.println("\nRoom Types");
        System.out.println("1. Deluxe");
        System.out.println("2. Executive");
        System.out.println("3. Presidential");

        System.out.print("Choose room: ");
        int roomChoice = sc.nextInt();
        sc.nextLine();

        String room="";

        if(roomChoice==1) room="Deluxe";
        else if(roomChoice==2) room="Executive";
        else if(roomChoice==3) room="Presidential";
        else {
            System.out.println("Invalid room");
            return;
        }

        Booking booking = new Booking(user.name,hotel,room,price);

        bookings.add(booking);

        bookingQueue.add(user.name);

        System.out.println("Booking successful!");

    }


    static void viewBookings() {

        System.out.println("\n===== BOOKINGS =====");

        if(bookings.isEmpty()) {
            System.out.println("No bookings found.");
            return;
        }

        for(Booking b : bookings) {

            System.out.println(
                    b.customerName +
                    " booked " +
                    b.roomType +
                    " at " +
                    b.hotel +
                    " ₹" + b.price);
        }
    }


    public static void main(String[] args) {

        loadDemoUsers();

        User loggedUser = null;

        while(loggedUser == null) {
            loggedUser = login();
        }

        int choice;

        do {

            System.out.println("\n===== LUXURY STAY MENU =====");
            System.out.println("1. View Hotels");
            System.out.println("2. Book Room");
            System.out.println("3. View Bookings");
            System.out.println("4. Exit");

            System.out.print("Choice: ");
            choice = sc.nextInt();
            sc.nextLine();

            switch(choice) {

                case 1:
                    showHotels();
                    break;

                case 2:
                    bookRoom(loggedUser);
                    break;

                case 3:
                    viewBookings();
                    break;

                case 4:
                    System.out.println("Thank you for visiting Luxury Stay");
                    break;

                default:
                    System.out.println("Invalid choice");
            }

        } while(choice != 4);

    }
}
