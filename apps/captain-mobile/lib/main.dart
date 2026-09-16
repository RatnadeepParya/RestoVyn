import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/floor_screen.dart';

void main() {
  runApp(const RestoVynCaptainApp());
}

class RestoVynCaptainApp extends StatelessWidget {
  const RestoVynCaptainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RestoVyn Captain',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF10B981),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        useMaterial3: true,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginScreen(),
        '/floor': (context) => const FloorScreen(),
      },
    );
  }
}
